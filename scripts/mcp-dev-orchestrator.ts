#!/usr/bin/env tsx
/**
 * MCP server — Parallel Agent Orchestrator
 *
 * Generic async dispatcher: fires one Copilot SDK session per task, any agent role.
 *
 * Tools:
 *
 *   run_async_subagents(tasks, clarifications?)
 *     → { runId, startedAt, taskIds }
 *     Each task carries its own id, role, and full prompt — the orchestrator
 *     decides what to ask; this server just fires the sessions in parallel.
 *     Returns a runId immediately (non-blocking).
 *
 *   get_run_status(runId)
 *     → { status, results, pendingClarification }
 *     Poll until "done" or "pending-clarification".
 *
 *   submit_clarifications(runId, clarifications)
 *     → { runId, startedAt, taskIds }
 *     Re-queues only the blocked tasks from a previous run, injecting
 *     clarification text into each prompt. Returns a new runId.
 *
 * Registration: .vscode/mcp.json
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CopilotClient, approveAll, type MCPServerConfig } from "@github/copilot-sdk";
import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, unlinkSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { basename, join, resolve } from "node:path";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import {
    FALLBACK_MODEL,
    defaultModelForRole,
    reasoningEffortSelectionForModel,
    type ModelReasoningSupport,
} from "./agent-model-routing.ts";

// ── Config ────────────────────────────────────────────────────────────────────

const WORKSPACE_ROOT = resolve(fileURLToPath(new URL(".", import.meta.url)), "..");
const AGENTS_DIR = join(WORKSPACE_ROOT, ".github", "agents");
const MCP_CONFIG_PATH = join(WORKSPACE_ROOT, ".vscode", "mcp.json");
const LOG_DIR = resolve(fileURLToPath(new URL(".", import.meta.url)), "../logs/parallel-agents");
const AGENT_TIMEOUT_MS = 60 * 60 * 1000; // 1 hour per agent

// ── Runtime MCP resolution ────────────────────────────────────────────────────
// Reads the agent file and mcp.json fresh on every dispatch — no startup index,
// no hardcoded prefix map. Zero code changes needed when adding a new MCP.
//
// Convention: each server entry in .vscode/mcp.json may carry a `_toolPrefixes`
// array declaring which tool-namespace prefixes it serves (the same prefixes
// that appear in agent frontmatter tools: lists). If omitted, the server key
// itself is used as the prefix (works when key == namespace, e.g. "my-server").
//
// Example .vscode/mcp.json entry:
//   "figma": { "type": "sse", "url": "...", "_toolPrefixes": ["com.figma.mcp"] }
//   "chrome-devtools": { "type": "stdio", "command": "...", "_toolPrefixes": ["io.github.chromedevtools"] }

function readAgentTools(role: string): string[] {
    try {
        const files = readdirSync(AGENTS_DIR).filter((f) => f.endsWith(".agent.md"));
        for (const file of files) {
            const content = readFileSync(join(AGENTS_DIR, file), "utf-8");
            const nameMatch = content.match(/^name:\s*(.+)$/m);
            if (!nameMatch || nameMatch[1].trim() !== role) continue;
            // Parse tools: [...] from YAML frontmatter
            const fmMatch = content.match(/^---[\s\S]*?^---/m);
            if (!fmMatch) return [];
            const toolsLine = fmMatch[0].match(/^tools:\s*\[(.*)\]/m);
            if (!toolsLine) return [];
            return toolsLine[1]
                .split(",")
                .map((t) => t.trim().replace(/^['"]/, "").replace(/['"]$/, ""))
                .filter(Boolean);
        }
    } catch (err) {
        console.error(`[agent-orchestrator] Warning: could not read agent file for role '${role}':`, err);
    }
    return [];
}

function resolveAgentMcpServers(role: string): Record<string, MCPServerConfig> {
    const agentTools = readAgentTools(role);
    if (agentTools.length === 0) return {};

    let rawRegistry: Record<string, any> = {};
    try {
        rawRegistry = JSON.parse(readFileSync(MCP_CONFIG_PATH, "utf-8")).servers ?? {};
    } catch {
        return {};
    }

    const result: Record<string, MCPServerConfig> = {};
    for (const [serverKey, rawConfig] of Object.entries(rawRegistry)) {
        // Strip our private annotations before passing to the SDK
        const { _toolPrefixes, _envHeaders, ...config } = rawConfig as {
            _toolPrefixes?: string[];
            _envHeaders?: Record<string, string>;
            [k: string]: unknown;
        };
        const prefixes: string[] = _toolPrefixes ?? [serverKey];
        const matched = agentTools.some((tool) =>
            prefixes.some((p) => tool === p || tool.startsWith(p + "/"))
        );
        if (!matched) continue;

        if (_envHeaders) {
            const resolved: Record<string, string> = {};
            const envVarPattern = /\$([A-Z_][A-Z0-9_]*)/g;
            for (const [header, template] of Object.entries(_envHeaders)) {
                const referencedEnvVars = Array.from(template.matchAll(envVarPattern), (match) => match[1]);
                const hasMissingEnvSubstitution = referencedEnvVars.some((name) => {
                    const value = process.env[name];
                    return value === undefined || value.trim() === "";
                });
                if (hasMissingEnvSubstitution) continue;

                const expanded = template.replace(envVarPattern, (_, name) => process.env[name] ?? "");
                const expandedTokens = expanded.trim().split(/\s+/).filter(Boolean);
                const hasSchemeWithoutToken = template.includes(" ") && expandedTokens.length < 2;
                if (expandedTokens.length === 0 || hasSchemeWithoutToken) continue;

                resolved[header] = expanded;
            }
            if (Object.keys(resolved).length > 0) {
                (config as any).headers = resolved;
            }
        }

        result[serverKey] = config as MCPServerConfig;
    }
    return result;
}

// ── Default system messages per known role ────────────────────────────────────

const DEFAULT_SYSTEM_MESSAGES: Record<string, string> = {
    dev: `\
You are a dev agent. Implement exactly one approved Gate 4 task per session.
Follow .github/agents/dev.agent.md as the authoritative protocol.
Never commit directly to master. Always use a git worktree for your branch.
When blocked, surface the issue clearly under "Open Questions" and set
Build Readiness: Needs Clarification.`,

    "runtime-qa": `\
You are a runtime-qa agent. Execute acceptance-criterion browser journeys for the
assigned issue across the required viewport and theme matrix.
Follow .github/agents/runtime-qa.agent.md as the authoritative protocol.
Return a Runtime QA Verdict Package.`,

    "prd-agent": `\
You are a PRD agent. Convert the provided Requirement Context Package into a
PRD v0 draft and validate completeness.
Follow .github/agents/prd.agent.md as the authoritative protocol.`,

    "requirement-challenger": `\
You are a requirement challenger. Grill the provided requirements, expose ambiguity,
challenge assumptions, identify missing information, and score readiness.
Follow .github/agents/requirement-challenger.agent.md as the authoritative protocol.`,

    "design-qa-agent": `\
You are a design QA agent. Review the provided Design Draft Package against PRD
and UX artifacts and produce a Design QA Verdict Package.
Follow .github/agents/design-qa.agent.md as the authoritative protocol.`,
};

function systemMessageForRole(role: string, override?: string): string {
    return override ?? DEFAULT_SYSTEM_MESSAGES[role] ?? `You are a ${role} agent. Follow the relevant agent protocol in .github/agents/.`;
}

// ── Types ─────────────────────────────────────────────────────────────────────

type TaskStatus = "done" | "needs-clarification" | "failed";
type RunStatus = "running" | "done" | "pending-clarification" | "failed";

interface Task {
    id: string;              // stable label: "issue/116", "prd-run-1", "qa-mobile", anything
    role: string;            // agent role: "dev", "runtime-qa", "prd-agent", etc.
    prompt: string;          // full prompt to send — orchestrator builds this
    systemMessage?: string;  // override default system message for this role
    // mcpServers is NOT exposed in the public API — derived automatically from
    // the agent's tools: frontmatter + .vscode/mcp.json. No manual injection needed.
}

interface TaskResult {
    taskId: string;
    role: string;
    model: string;
    sessionId: string;
    status: TaskStatus;
    output?: string;
    challenge?: string;
    error?: string;
}

interface Run {
    runId: string;
    startedAt: string;
    taskIds: string[];
    status: RunStatus;
    results: TaskResult[];
    pendingClarification: string[]; // taskIds
    finishedAt?: string;
    _tasks: Task[];  // kept for submit_clarifications replay
}

// persistRuns writes a lossy schema: _tasks is omitted and results[].output is
// stripped to keep runs.json small. Use PersistedRun when reading from disk
// (loadPersistedRuns and get_run_status disk-refresh) so TypeScript surfaces
// missing fields instead of silently assuming they exist.
type PersistedTaskResult = Omit<TaskResult, "output"> & { output?: never };
type PersistedRun = Omit<Run, "_tasks" | "results"> & {
    _tasks?: never;
    results: PersistedTaskResult[];
};

// ── Run registry (in-memory + disk) ──────────────────────────────────────────

const RUNS_FILE = join(LOG_DIR, "runs.json");

const runs = new Map<string, Run>();

function persistRuns(): void {
    try {
        mkdirSync(LOG_DIR, { recursive: true });
        const snapshot: Record<string, Omit<Run, "_tasks"> & { _tasks?: unknown }> = {};
        for (const [id, run] of runs) {
            const { _tasks, ...rest } = run;
            // Strip full output from disk — already saved to per-task .log files.
            // Keeps runs.json small so the VS Code watcher stays fast as history grows.
            snapshot[id] = {
                ...rest,
                results: rest.results.map(({ output, ...r }) => r),
            };
        }
        const tmp = RUNS_FILE + ".tmp";
        writeFileSync(tmp, JSON.stringify(snapshot, null, 2), "utf-8");
        try {
            renameSync(tmp, RUNS_FILE);
        } catch {
            // Windows: fs.rename cannot overwrite an existing file (EPERM); unlink first
            try { unlinkSync(RUNS_FILE); } catch { /* file may not exist on first write */ }
            renameSync(tmp, RUNS_FILE);
        }
    } catch {
        // non-fatal — in-memory state is authoritative
    }
}

function hydratePersistedResults(results: Array<Omit<PersistedTaskResult, "model"> & { model?: string }>): {
    results: TaskResult[];
    changed: boolean;
} {
    let changed = false;
    const hydratedResults = results.map((result) => {
        if (typeof result.model === "string" && result.model.length > 0) {
            return result as TaskResult;
        }

        changed = true;
        return {
            ...result,
            model: defaultModelForRole(result.role),
        } as TaskResult;
    });

    return { results: hydratedResults, changed };
}

function loadPersistedRuns(): void {
    try {
        if (!existsSync(RUNS_FILE)) return;
        let mutated = false;
        const raw = JSON.parse(readFileSync(RUNS_FILE, "utf-8")) as Record<string, PersistedRun>;
        for (const [id, persisted] of Object.entries(raw)) {
            const { results, changed } = hydratePersistedResults(persisted.results);
            // Hydrate the lossy persisted shape back to a full Run before mutating.
            const run: Run = {
                ...persisted,
                _tasks: [],
                results,
            };
            if (changed) mutated = true;
            // Mark any run that was "running" at crash time as failed
            if (run.status === "running") {
                run.status = "failed";
                run.finishedAt = nowIST();
                const existingResults = run.results ?? [];
                run.results = existingResults.concat(
                    (run.taskIds ?? [])
                        .filter((tid) => !existingResults.some((r) => r.taskId === tid))
                        .map((tid) => ({
                            taskId: tid,
                            role: "unknown",
                            model: FALLBACK_MODEL,
                            sessionId: "unknown",
                            status: "failed" as TaskStatus,
                            error: "Orchestrator crashed or restarted before task completed",
                        }))
                );
                mutated = true;
            }
            runs.set(id, run);
        }
        if (mutated) persistRuns();
    } catch {
        // corrupted file — start fresh
    }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function detectNeedsClarification(output: string): boolean {
    return /build readiness\s*:\s*needs clarification/i.test(output);
}

function extractChallenge(output: string): string {
    const m = output.match(
        /(?:open questions|needs clarification|blockers?)[^\n]*\n([\s\S]{1,800}?)(?:\n#{1,3} |\n---|\n\*\*\*|$)/i
    );
    return m ? m[1].trim() : output.slice(0, 600).trim();
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function nowIST(): string {
    return new Date().toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
    }) + " IST";
}

// ── Core: run one agent session ───────────────────────────────────────────────

async function runAgentTask(
    client: CopilotClient,
    task: Task,
    availableModels: readonly ModelReasoningSupport[],
    clarification?: string,
    runId?: string,
    dispatchedAt?: string,
): Promise<TaskResult> {
    const model = defaultModelForRole(task.role);
    const reasoningEffort = reasoningEffortSelectionForModel(model, availableModels).reasoningEffort;
    const title = task.prompt.split("\n").find((l) => l.trim())?.trim().slice(0, 80) ?? task.id;
    const repo = basename(WORKSPACE_ROOT);
    const provenance = runId
        ? [
            "",
            "## Agent Provenance (include verbatim in every PR body you open)",
            "```",
            `run-id:     ${runId}`,
            `task-id:    ${task.id}`,
            `title:      ${title}`,
            `role:       ${task.role}`,
            `model:      ${model}`,
            `repo:       ${repo}`,
            `dispatched: ${dispatchedAt}`,
            "```",
            "",
          ].join("\n")
        : "";
    const finalPrompt = clarification
        ? `${task.prompt}${provenance}\n\n## Orchestrator clarification\n\n${clarification}`
        : `${task.prompt}${provenance}`;

    const mcpServers = resolveAgentMcpServers(task.role);
    // Declare outside try so finally can reference it for disconnect; starts
    // undefined so a session-creation failure also gets a task-scoped result.
    let session: Awaited<ReturnType<typeof client.createSession>> | undefined;

    try {
        // createSession is inside try so a failure returns a task-scoped
        // "failed" result rather than throwing into Promise.all.
        session = await client.createSession({
            model,
            reasoningEffort,
            onPermissionRequest: approveAll,
            systemMessage: { content: systemMessageForRole(task.role, task.systemMessage) },
            ...(Object.keys(mcpServers).length > 0 ? { mcpServers } : {}),
        });

        const result = await session.sendAndWait(
            { prompt: finalPrompt },
            AGENT_TIMEOUT_MS
        );

        const output = result?.data?.content ?? "(no output)";

        // Log write is best-effort — a disk/permission error must not flip a
        // successful agent session to "failed".
        try {
            mkdirSync(LOG_DIR, { recursive: true });
            const safeId = task.id.replace(/[^a-zA-Z0-9_-]/g, "_");
            writeFileSync(join(LOG_DIR, `${runId}-${safeId}.log`), output, "utf-8");
        } catch {
            // non-fatal — session result is still returned correctly
        }

        if (detectNeedsClarification(output)) {
            return {
                taskId: task.id,
                role: task.role,
                model,
                sessionId: session.sessionId,
                status: "needs-clarification",
                output,
                challenge: extractChallenge(output),
            };
        }

        return { taskId: task.id, role: task.role, model, sessionId: session.sessionId, status: "done", output };
    } catch (err) {
        return {
            taskId: task.id,
            role: task.role,
            model,
            sessionId: session?.sessionId ?? "unknown",
            status: "failed",
            error: err instanceof Error ? err.message : String(err),
        };
    } finally {
        // Best-effort teardown — a disconnect() rejection must not mask the
        // already-returned task result (or throw into Promise.all).
        try { await session?.disconnect(); } catch { /* non-fatal */ }
    }
}

// ── Core: start a run (non-blocking) ─────────────────────────────────────────

function startRun(tasks: Task[], clarifications: Record<string, string>): Run {
    const runId = randomUUID();
    const startedAt = nowIST();

    const run: Run = {
        runId,
        startedAt,
        taskIds: tasks.map((t) => t.id),
        status: "running",
        results: [],
        pendingClarification: [],
        _tasks: tasks,
    };
    runs.set(runId, run);
    persistRuns();

    (async () => {
        const client = new CopilotClient();
        await client.start();
        const availableModels = await client.listModels().catch(() => []);

        try {
            const results = await Promise.all(
                tasks.map((t) => runAgentTask(client, t, availableModels, clarifications[t.id], runId, startedAt))
            );

            run.results = results;
            run.pendingClarification = results
                .filter((r) => r.status === "needs-clarification")
                .map((r) => r.taskId);
            run.finishedAt = nowIST();
            const hasFailed = run.results.some((r) => r.status === "failed");
            run.status = run.pendingClarification.length > 0
                ? "pending-clarification"
                : hasFailed ? "failed" : "done";
            persistRuns();

            // Summary write is best-effort — a filesystem error here must not
            // overwrite the already-committed run.results via the outer .catch.
            try {
                mkdirSync(LOG_DIR, { recursive: true });
                writeFileSync(
                    join(LOG_DIR, "run-summary.json"),
                    JSON.stringify({ ...run, _tasks: undefined }, null, 2),
                    "utf-8"
                );
            } catch {
                // non-fatal
            }
        } finally {
            // Teardown is best-effort — a stop() rejection must not propagate to
            // the outer .catch and clobber already-committed run.results.
            try { await client.stop(); } catch { /* non-fatal */ }
        }
    })().catch((err) => {
        run.status = "failed";
        run.finishedAt = nowIST();
        run.results = tasks.map((t) => ({
            taskId: t.id,
            role: t.role,
            model: defaultModelForRole(t.role),
            sessionId: "unknown",
            status: "failed" as TaskStatus,
            error: String(err),
        }));
        persistRuns();
    });

    return run;
}

// ── MCP Server ────────────────────────────────────────────────────────────────

const server = new McpServer({
    name: "agent-orchestrator",
    version: "2.0.0",
});

// Tool 1: run_async_subagents
server.tool(
    "run_async_subagents",
    "Start parallel Copilot agent sessions — one per task, any agent role. " +
    "Each task carries its own id, role, and full prompt. The orchestrator " +
    "builds the prompts; this tool fires and tracks the sessions. " +
    "Returns a runId immediately; poll with get_run_status.",
    {
        tasks: z
            .array(
                z.object({
                    id: z.string().min(1).describe(
                        "Stable label for this task: 'issue/116', 'prd-run-1', 'qa-mobile', anything"
                    ),
                    role: z.string().min(1).describe(
                        "Agent role: 'dev', 'runtime-qa', 'prd-agent', 'requirement-challenger', 'design-qa-agent', or any custom role"
                    ),
                    prompt: z.string().min(1).describe(
                        "Full prompt to send to the agent — orchestrator builds this"
                    ),
                    systemMessage: z.string().optional().describe(
                        "Override the default system message for this role"
                    ),
                })
            )
            .min(1)
            .describe("Tasks to run in parallel"),
        clarifications: z
            .record(z.string(), z.string())
            .optional()
            .describe("Optional map of taskId → clarification text for re-runs after a challenge loop"),
    },
    async ({ tasks, clarifications = {} }) => {
        const run = startRun(tasks, clarifications);

        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(
                        { runId: run.runId, startedAt: run.startedAt, taskIds: run.taskIds, status: run.status },
                        null,
                        2
                    ),
                },
            ],
        };
    }
);

// Tool 2: get_run_status
server.tool(
    "get_run_status",
    "Poll the status of a parallel agent run. When status is 'pending-clarification', " +
    "read pendingClarification and challenge fields, resolve with PO, then call " +
    "submit_clarifications to re-queue the blocked tasks.",
    {
        runId: z.string().uuid().describe("runId returned by run_async_subagents"),
    },
    async ({ runId }) => {
        // Re-read from disk before serving status so a restarted MCP process can
        // observe a newer persisted terminal state, but do NOT blindly replace
        // richer in-memory data with the lossy on-disk snapshot (persistRuns strips
        // TaskResult.output, so an unconditional overwrite drops outputPreview).
        const isTerminalStatus = (s: Run["status"]) =>
            s === "done" || s === "failed" || s === "pending-clarification";

        const shouldPreferDisk = (mem: Run, disk: Run): boolean => {
            // Always prefer disk when memory was crash-marked "failed" at startup
            // and disk now has a real terminal state.
            if (mem.status === "failed" && isTerminalStatus(disk.status)) return true;
            // Prefer disk when disk is terminal and memory is not — disk caught a
            // completion that the in-memory run hasn't observed yet.
            if (isTerminalStatus(disk.status) && !isTerminalStatus(mem.status)) return true;
            // Prefer disk when disk has a finishedAt that memory lacks or is older.
            // finishedAt is produced by nowIST() which returns a locale-formatted string
            // ("17 Apr 2026, 22:00:00 IST") — not ISO 8601. Date.parse may return NaN,
            // so guard explicitly and treat NaN as "indeterminate" (keep memory).
            if (disk.finishedAt) {
                if (!mem.finishedAt) return true;
                const diskMs = new Date(disk.finishedAt).getTime();
                const memMs = new Date(mem.finishedAt).getTime();
                if (!Number.isFinite(diskMs) || !Number.isFinite(memMs)) return false;
                return diskMs >= memMs;
            }
            return false;
        };

        const mergeRunState = (mem: Run | undefined, disk: Run): Run => {
            if (!mem) return { ...disk, _tasks: disk._tasks ?? [] };

            const memById = new Map(mem.results.map((r) => [r.taskId, r]));
            const diskById = new Map(disk.results.map((r) => [r.taskId, r]));
            const allIds = new Set([...memById.keys(), ...diskById.keys()]);
            const preferDisk = shouldPreferDisk(mem, disk);

            const mergedResults = Array.from(allIds).map((id) => {
                const mr = memById.get(id);
                const dr = diskById.get(id);
                if (!mr) return dr!;
                if (!dr) return mr;
                // Whichever source wins, always preserve richer in-memory output.
                return {
                    ...(preferDisk ? mr : dr),
                    ...(preferDisk ? dr : mr),
                    output: mr.output ?? dr.output,
                };
            });

            return {
                ...(preferDisk ? mem : disk),
                ...(preferDisk ? disk : mem),
                results: mergedResults,
                _tasks: mem._tasks ?? disk._tasks ?? [],
                taskIds: mem.taskIds.length > 0 ? mem.taskIds : disk.taskIds,
                pendingClarification: preferDisk
                    ? (disk.pendingClarification ?? mem.pendingClarification)
                    : (mem.pendingClarification ?? disk.pendingClarification),
                finishedAt: preferDisk
                    ? (disk.finishedAt ?? mem.finishedAt)
                    : (mem.finishedAt ?? disk.finishedAt),
            };
        };

        try {
            if (existsSync(RUNS_FILE)) {
                const raw = JSON.parse(readFileSync(RUNS_FILE, "utf-8")) as Record<string, PersistedRun>;
                const diskRun = raw[runId];
                if (diskRun) {
                    const { results } = hydratePersistedResults(diskRun.results);
                    // Hydrate the lossy persisted shape back to Run: restore _tasks from
                    // memory (disk never has it) and keep results typed correctly.
                    const hydratedDisk: Run = {
                        ...diskRun,
                        _tasks: runs.get(runId)?._tasks ?? [],
                        results,
                    };
                    runs.set(runId, mergeRunState(runs.get(runId), hydratedDisk));
                }
            }
        } catch { /* non-fatal — fall through to in-memory state */ }

        const run = runs.get(runId);
        if (!run) {
            return {
                content: [{ type: "text", text: JSON.stringify({ error: `Run ${runId} not found` }) }],
                isError: true,
            };
        }

        const summary = {
            runId: run.runId,
            status: run.status,
            startedAt: run.startedAt,
            finishedAt: run.finishedAt,
            taskIds: run.taskIds,
            pendingClarification: run.pendingClarification,
            results: run.results.map((r) => ({
                taskId: r.taskId,
                role: r.role,
                model: r.model,
                status: r.status,
                sessionId: r.sessionId,
                ...(r.challenge ? { challenge: r.challenge } : {}),
                ...(r.error ? { error: r.error } : {}),
                ...(r.status === "done"
                    ? { outputPreview: r.output?.split("\n").slice(0, 30).join("\n") }
                    : {}),
            })),
        };

        return {
            content: [{ type: "text", text: JSON.stringify(summary, null, 2) }],
        };
    }
);

// Tool 3: submit_clarifications
server.tool(
    "submit_clarifications",
    "Re-queue only the blocked tasks from a previous run, injecting PO-approved " +
    "clarifications into each prompt. Returns a new runId.",
    {
        runId: z
            .string()
            .uuid()
            .describe("runId of the run that produced pending-clarification results"),
        clarifications: z
            .record(z.string(), z.string())
            .describe("Map of taskId → clarification text approved by PO"),
    },
    async ({ runId, clarifications }) => {
        const previousRun = runs.get(runId);
        if (!previousRun) {
            return {
                content: [{ type: "text", text: JSON.stringify({ error: `Run ${runId} not found` }) }],
                isError: true,
            };
        }

        // _tasks is not persisted across restarts — guard before attempting replay
        if (previousRun._tasks.length === 0 && previousRun.pendingClarification.length > 0) {
            return {
                content: [{ type: "text", text: JSON.stringify({
                    error: "Cannot re-queue: task details were not persisted across an orchestrator restart. " +
                           "Submit a new run_async_subagents call to replace this run.",
                    pendingClarification: previousRun.pendingClarification,
                }) }],
                isError: true,
            };
        }

        const blockedIds = new Set(previousRun.pendingClarification);
        const tasksToRetry = previousRun._tasks.filter(
            (t) => blockedIds.has(t.id) && Object.prototype.hasOwnProperty.call(clarifications, t.id)
        );

        if (tasksToRetry.length === 0) {
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify({
                            error: "No matching blocked tasks found for the provided clarifications",
                            pendingClarification: previousRun.pendingClarification,
                        }),
                    },
                ],
                isError: true,
            };
        }

        const run = startRun(tasksToRetry, clarifications);

        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(
                        { runId: run.runId, startedAt: run.startedAt, taskIds: run.taskIds, status: run.status, retryOf: runId },
                        null,
                        2
                    ),
                },
            ],
        };
    }
);

// ── Boot ──────────────────────────────────────────────────────────────────────

loadPersistedRuns();
const transport = new StdioServerTransport();
await server.connect(transport);
