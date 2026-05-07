#!/usr/bin/env tsx
/**
 * run-agent.ts — Fire a single Copilot SDK agent session and wait for its result.
 *
 * Usage:
 *   npx tsx scripts/run-agent.ts [options] <role> "<prompt>" OR @<prompt-file>
 *
 * Options:
 *   --pre-sleep <seconds>   Sleep before sending the prompt (useful for async demo runs)
 *   --no-intro              Skip the automatic role-introduction prefix
 *   --model <model-id>      Override the role default model (otherwise uses configured routing)
 *   --task-id <task-id>     Optional issue/task reference for provenance block
 *   --output-format json    Emit a JSON result record to stdout instead of human text
 *
 * Examples:
 *   npx tsx scripts/run-agent.ts prd-agent "Draft a PRD for a dark-mode toggle"
 *   npx tsx scripts/run-agent.ts dev @docs/slices/my-slice/06-tasks.md
 *   npx tsx scripts/run-agent.ts --output-format json prd-agent "Draft AC"
 *   npx tsx scripts/run-agent.ts --no-intro dev @06-tasks.md
 *
 * Designed for async background use via run_in_terminal (mode=async):
 *   kick it off, continue chatting, get notified on completion.
 */

import { CopilotClient, approveAll, type MCPServerConfig } from "@github/copilot-sdk";
import { appendFileSync, existsSync, mkdirSync, readFileSync, readdirSync, renameSync, unlinkSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, resolve } from "node:path";
import { randomUUID } from "node:crypto";
import {
    reasoningEffortSelectionForModel,
    modelSelectionForRole,
    type ReasoningEffort,
    type ReasoningEffortSource,
} from "./agent-model-routing.ts";

// ── Config ────────────────────────────────────────────────────────────────────

const TIMEOUT_MS = 60 * 60 * 1000; // 1 hour
const MAX_RETRIES = 3;             // Retry sendAndWait on transient failures
const RETRY_BASE_MS = 2_000;       // Exponential backoff base (2 s → 4 s → 8 s)

// Prepended to every prompt so the agent always opens with a role introduction.
// Skipped when --no-intro flag is passed (e.g. for structured @file prompts).
const ROLE_INTRO_PREFIX =
    "Begin your response with a single sentence identifying your agent role and primary responsibility. " +
    "Then respond to the following:\n\n";

const RUNS_LOG_DIR = join(
    resolve(fileURLToPath(new URL(".", import.meta.url)), ".."),
    "logs", "parallel-agents"
);
const RUNS_INDEX_PATH = join(RUNS_LOG_DIR, "runs.json");
const RUNS_INDEX_LOCK_PATH = `${RUNS_INDEX_PATH}.lock`;
const RUNS_INDEX_LOCK_WAIT_MS = 5_000;
const RUNS_INDEX_LOCK_RETRY_MS = 50;
const SLEEP_WAIT_BUFFER = new Int32Array(new SharedArrayBuffer(4));

const WORKSPACE_ROOT = resolve(fileURLToPath(new URL(".", import.meta.url)), "..");
const AGENTS_DIR = join(WORKSPACE_ROOT, ".github", "agents");
const MCP_CONFIG_PATH = join(WORKSPACE_ROOT, ".vscode", "mcp.json");

// ── Agent file parsing ────────────────────────────────────────────────────────
// Single scan per invocation: reads tools list and system message body from
// the matching .agent.md file so we never read the same file twice.

interface AgentMeta {
    tools: string[];
    systemMessage: string;
}

type RunTaskStatus = "done" | "failed" | "needs-clarification";
type RunStatus = "running" | "done" | "failed" | "pending-clarification";
type RunPhase =
    | "dispatched"
    | "model-resolved"
    | "session-created"
    | "waiting-before-send"
    | "waiting-for-agent"
    | "completed"
    | "needs-clarification"
    | "failed";

interface RunTaskResult {
    taskId: string;
    role: string;
    status: RunTaskStatus;
    error?: string;
    challenge?: string;
}

interface RunRecordIndex {
    runId: string;
    startedAt: string;
    finishedAt?: string;
    status: RunStatus;
    phase?: RunPhase;
    lastHeartbeatAt?: string;
    progressLogPath?: string;
    semanticProgressSupported?: boolean;
    semanticProgressLogPath?: string;
    taskIds: string[];
    results: RunTaskResult[];
    pendingClarification: string[];
}

type RunsIndexSnapshot = Record<string, RunRecordIndex>;

interface AsyncRunContext {
    runId: string;
    role: string;
    model: string;
    startedAt: string;
    taskId: string;
    progressLogPath: string;
    agentMilestonesSupported: boolean;
    semanticProgressLogPath?: string;
}

type ProgressEventKind = "meta" | "lifecycle" | "milestone";
type ProgressEventSource = "wrapper" | "agent";

function readAgentMeta(agentRole: string): AgentMeta {
    const fallback: AgentMeta = {
        tools: [],
        systemMessage: `You are a ${agentRole} agent. Follow the relevant protocol in .github/agents/.`,
    };
    try {
        const files = readdirSync(AGENTS_DIR).filter((f) => f.endsWith(".agent.md"));
        for (const file of files) {
            const content = readFileSync(join(AGENTS_DIR, file), "utf-8");
            const nameMatch = content.match(/^name:\s*(.+)$/m);
            if (!nameMatch || nameMatch[1].trim() !== agentRole) continue;

            const fmMatch = content.match(/^---[\s\S]*?^---/m);
            const tools: string[] = fmMatch
                ? (fmMatch[0].match(/^tools:\s*\[(.*)\]/m)?.[1] ?? "")
                    .split(",")
                    .map((t) => t.trim().replace(/^['"]/, "").replace(/['"]$/, ""))
                    .filter(Boolean)
                : [];

            const systemMessage =
                content.replace(/^---[\s\S]*?^---\s*/m, "").trim() || fallback.systemMessage;

            return { tools, systemMessage };
        }
    } catch (err) {
        console.error(`[run-agent] Warning: could not parse agent file for role '${agentRole}':`, err);
    }
    return fallback;
}

// ── MCP resolution ────────────────────────────────────────────────────────────
// Matches agent tools list against .vscode/mcp.json server entries.

function resolveAgentMcpServers(agentTools: string[]): Record<string, MCPServerConfig> {
    if (agentTools.length === 0) return {};

    let rawRegistry: Record<string, any> = {};
    try {
        rawRegistry = JSON.parse(readFileSync(MCP_CONFIG_PATH, "utf-8")).servers ?? {};
    } catch {
        return {};
    }

    const result: Record<string, MCPServerConfig> = {};
    for (const [serverKey, rawConfig] of Object.entries(rawRegistry)) {
        const { _toolPrefixes, _envHeaders, ...config } = rawConfig as {
            [k: string]: unknown;
        } & MCPServerConfig & {
            _toolPrefixes?: string[];
            _envHeaders?: Record<string, string>;
        };
        const prefixes: string[] = _toolPrefixes ?? [serverKey];
        const matched = agentTools.some((tool) =>
            prefixes.some((p) => tool === p || tool.startsWith(p + "/"))
        );
        if (!matched) continue;

        // Expand _envHeaders: replace $VAR_NAME with process.env[VAR_NAME].
        // Skip any header with missing/empty env substitutions or invalid empty tokens.
        if (_envHeaders) {
            const resolved: Record<string, string> = {};
            const resolvedHeaderNames: string[] = [];
            const skippedHeaderNames: string[] = [];
            const envVarPattern = /\$([A-Z_][A-Z0-9_]*)/g;
            for (const [header, template] of Object.entries(_envHeaders)) {
                const referencedEnvVars = Array.from(template.matchAll(envVarPattern), (match) => match[1]);
                const hasMissingEnvSubstitution = referencedEnvVars.some((name) => {
                    const value = process.env[name];
                    return value === undefined || value.trim() === "";
                });
                if (hasMissingEnvSubstitution) {
                    skippedHeaderNames.push(header);
                    continue;
                }

                const expanded = template.replace(envVarPattern, (_, name) => process.env[name] ?? "");
                const expandedTokens = expanded.trim().split(/\s+/).filter(Boolean);
                const hasSchemeWithoutToken = template.includes(" ") && expandedTokens.length < 2;
                if (expandedTokens.length === 0 || hasSchemeWithoutToken) {
                    skippedHeaderNames.push(header);
                    continue;
                }

                resolved[header] = expanded;
                resolvedHeaderNames.push(header);
            }
            if (Object.keys(resolved).length > 0) {
                (config as any).headers = resolved;
            }
            const logParts = [
                `resolved=[${resolvedHeaderNames.join(", ") || "none"}]`,
                `skipped=[${skippedHeaderNames.join(", ") || "none"}]`,
            ];
            logInfo(`[run-agent] mcp-hdrs ${serverKey}: ${logParts.join(" ")}`);
        }

        // Required by MCPServerConfigBase: "[]" means no tools, "*" means all.
        // Default to exposing all tools from the server unless the mcp.json entry
        // already specifies an explicit list.
        if (!Array.isArray((config as any).tools)) {
            (config as any).tools = ["*"];
        }

        result[serverKey] = config;
    }
    return result;
}

// ── Args ──────────────────────────────────────────────────────────────────────

let preSleepMs = 0;
let noIntro = false;
let modelOverride: string | undefined;
let taskIdArg: string | undefined;
let outputFormat: "text" | "json" = "text";
const argv = process.argv.slice(2);

function requireOptionValue(option: string, value: string | undefined): string {
    if (!value || value.startsWith("--")) {
        console.error(`Missing value for ${option}`);
        process.exit(1);
    }
    return value;
}

for (let i = 0; i < argv.length;) {
    if (argv[i] === "--pre-sleep") {
        const rawSeconds = requireOptionValue("--pre-sleep", argv[i + 1]);
        const seconds = parseInt(rawSeconds, 10);
        if (!Number.isFinite(seconds) || seconds < 0) {
            console.error(`Invalid value for --pre-sleep: ${rawSeconds}`);
            process.exit(1);
        }
        preSleepMs = seconds * 1000;
        argv.splice(i, 2);
    } else if (argv[i] === "--no-intro") {
        noIntro = true;
        argv.splice(i, 1);
    } else if (argv[i] === "--model") {
        modelOverride = requireOptionValue("--model", argv[i + 1]);
        argv.splice(i, 2);
    } else if (argv[i] === "--task-id") {
        taskIdArg = requireOptionValue("--task-id", argv[i + 1]);
        argv.splice(i, 2);
    } else if (argv[i] === "--output-format") {
        const format = requireOptionValue("--output-format", argv[i + 1]);
        if (format !== "json" && format !== "text") {
            console.error(`Invalid value for --output-format: ${format}. Use \"text\" or \"json\".`);
            process.exit(1);
        }
        outputFormat = format;
        argv.splice(i, 2);
    } else {
        if (argv[i].startsWith("--")) {
            console.error(`Unknown option: ${argv[i]}`);
            process.exit(1);
        }
        i++;
    }
}

function logInfo(message: string): void {
    const out = outputFormat === "json" ? process.stderr : process.stdout;
    out.write(`${message}\n`);
}

if (argv.length !== 2) {
    console.error(
        "Usage: npx tsx scripts/run-agent.ts [--pre-sleep <s>] [--no-intro] " +
        "[--model <id>] [--task-id <id>] " +
        "[--output-format json] <role> \"<prompt>\" OR @<prompt-file>"
    );
    process.exit(1);
}
const [role, rawPrompt] = argv;
const policyModelSelection = modelSelectionForRole(role);
const policyModel = policyModelSelection.model;
const model = modelOverride ?? policyModel;
const modelSource = modelOverride ? "model-override" : policyModelSelection.source;

// Support @file references: `@path/to/file.md` reads file contents as the prompt
const prompt = rawPrompt.startsWith("@")
    ? (() => {
        const filePath = rawPrompt.slice(1);
        if (!existsSync(filePath)) {
            console.error(`Prompt file not found: ${filePath}`);
            process.exit(1);
        }
        return readFileSync(filePath, "utf-8");
    })()
    : rawPrompt;

// ── Helpers ───────────────────────────────────────────────────────────────────

function runLogPath(runId: string): string {
    return join(RUNS_LOG_DIR, `${runId}.json`);
}

function runProgressLogPath(runId: string): string {
    return join(RUNS_LOG_DIR, `${runId}-progress.jsonl`);
}

function runSemanticProgressLogPath(runId: string): string {
    return join(RUNS_LOG_DIR, `${runId}-semantic-progress.md`);
}

function readRunsIndex(): RunsIndexSnapshot {
    if (!existsSync(RUNS_INDEX_PATH)) {
        return {};
    }

    try {
        return JSON.parse(readFileSync(RUNS_INDEX_PATH, "utf-8")) as RunsIndexSnapshot;
    } catch {
        return {};
    }
}

function writeJsonAtomic(path: string, payload: unknown): void {
    const temporaryPath = `${path}.tmp`;
    writeFileSync(temporaryPath, JSON.stringify(payload, null, 2), "utf-8");
    try {
        renameSync(temporaryPath, path);
    } catch {
        try {
            unlinkSync(path);
        } catch {
            // file may not exist on first write
        }
        renameSync(temporaryPath, path);
    }
}

function sleepSync(milliseconds: number): void {
    Atomics.wait(SLEEP_WAIT_BUFFER, 0, 0, milliseconds);
}

function readRunsIndexLockPid(): number | undefined {
    try {
        const raw = readFileSync(RUNS_INDEX_LOCK_PATH, "utf-8").trim();
        if (!raw) {
            return undefined;
        }
        const parsed = JSON.parse(raw) as { pid?: unknown };
        if (typeof parsed.pid !== "number" || !Number.isInteger(parsed.pid) || parsed.pid <= 0) {
            return undefined;
        }
        return parsed.pid;
    } catch {
        return undefined;
    }
}

function isProcessAlive(pid: number): boolean {
    try {
        process.kill(pid, 0);
        return true;
    } catch (err) {
        const processError = err as NodeJS.ErrnoException;
        return processError.code === "EPERM";
    }
}

function acquireRunsIndexLock(): void {
    const startedAt = Date.now();

    while (true) {
        try {
            writeFileSync(
                RUNS_INDEX_LOCK_PATH,
                JSON.stringify({
                    pid: process.pid,
                    acquiredAt: new Date().toISOString(),
                }),
                { encoding: "utf-8", flag: "wx" }
            );
            return;
        } catch (err) {
            const lockError = err as NodeJS.ErrnoException;
            if (lockError.code !== "EEXIST") {
                throw err;
            }

            const ownerPid = readRunsIndexLockPid();
            if (typeof ownerPid === "number" && !isProcessAlive(ownerPid)) {
                try {
                    unlinkSync(RUNS_INDEX_LOCK_PATH);
                    continue;
                } catch {
                    // Another process changed lock ownership; retry.
                }
            }

            if (Date.now() - startedAt >= RUNS_INDEX_LOCK_WAIT_MS) {
                const ownerPidText = typeof ownerPid === "number" ? `owner pid=${ownerPid}` : "owner pid=unknown";
                throw new Error(
                    `[run-agent] Timed out acquiring runs index lock after ${RUNS_INDEX_LOCK_WAIT_MS}ms (${ownerPidText}). ` +
                    `If the lock owner is no longer running, remove ${RUNS_INDEX_LOCK_PATH}.`
                );
            }

            sleepSync(RUNS_INDEX_LOCK_RETRY_MS);
        }
    }
}

function releaseRunsIndexLock(): void {
    try {
        unlinkSync(RUNS_INDEX_LOCK_PATH);
    } catch {
        // lock file may already be gone
    }
}

function resolveRunStatus(status: unknown, fallback: RunStatus): RunStatus {
    if (status === "running" || status === "done" || status === "failed" || status === "pending-clarification") {
        return status;
    }
    return fallback;
}

function resolveRunPhase(phase: unknown, fallback?: RunPhase): RunPhase | undefined {
    if (
        phase === "dispatched" ||
        phase === "model-resolved" ||
        phase === "session-created" ||
        phase === "waiting-before-send" ||
        phase === "waiting-for-agent" ||
        phase === "completed" ||
        phase === "needs-clarification" ||
        phase === "failed"
    ) {
        return phase;
    }
    return fallback;
}

function ensureProgressLog(runContext: AsyncRunContext): void {
    mkdirSync(RUNS_LOG_DIR, { recursive: true });
    if (existsSync(runContext.progressLogPath)) {
        return;
    }

    writeFileSync(
        runContext.progressLogPath,
        JSON.stringify({
            timestamp: runContext.startedAt,
            source: "wrapper" as ProgressEventSource,
            kind: "meta" as ProgressEventKind,
            runId: runContext.runId,
            taskId: runContext.taskId,
            role: runContext.role,
            model: runContext.model,
            workspaceRoot: WORKSPACE_ROOT,
            runRecordPath: runLogPath(runContext.runId),
        }) + "\n",
        "utf-8"
    );
}

function ensureSemanticProgressLog(runContext: AsyncRunContext): void {
    if (!runContext.semanticProgressLogPath) {
        return;
    }

    mkdirSync(RUNS_LOG_DIR, { recursive: true });
    if (existsSync(runContext.semanticProgressLogPath)) {
        return;
    }

    writeFileSync(
        runContext.semanticProgressLogPath,
        [
            "# Async Agent Semantic Milestones",
            "",
            `run-id: ${runContext.runId}`,
            `task-id: ${runContext.taskId}`,
            `role: ${runContext.role}`,
            `dispatched: ${runContext.startedAt}`,
            `model: ${runContext.model}`,
            `workspace-root: ${WORKSPACE_ROOT}`,
            `wrapper-progress-log: ${runContext.progressLogPath}`,
            "",
            "## Milestones",
            "",
        ].join("\n"),
        "utf-8"
    );
}

function supportsAgentMilestones(agentTools: string[]): boolean {
    return agentTools.includes("edit") || agentTools.includes("execute");
}

function appendProgressEvent(
    runContext: AsyncRunContext,
    source: ProgressEventSource,
    kind: ProgressEventKind,
    payload: Record<string, unknown>,
    timestamp = new Date().toISOString()
): void {
    ensureProgressLog(runContext);
    appendFileSync(
        runContext.progressLogPath,
        JSON.stringify({
            timestamp,
            source,
            kind,
            runId: runContext.runId,
            taskId: runContext.taskId,
            role: runContext.role,
            ...payload,
        }) + "\n",
        "utf-8"
    );
}

function recordRunProgress(
    runContext: AsyncRunContext,
    phase: RunPhase,
    detail: string,
    heartbeatAt = new Date().toISOString()
): void {
    const normalizedDetail = detail.replace(/\s+/g, " ").trim();
    appendProgressEvent(runContext, "wrapper", "lifecycle", { phase, detail: normalizedDetail }, heartbeatAt);
    persistRun({
        runId: runContext.runId,
        taskId: runContext.taskId,
        progressLogPath: runContext.progressLogPath,
        phase,
        lastHeartbeatAt: heartbeatAt,
    });
}

function persistRunsIndex(runRecord: Record<string, unknown>): void {
    let lockAcquired = false;
    try {
        const runId = runRecord.runId;
        if (typeof runId !== "string" || runId.length === 0) {
            return;
        }

        mkdirSync(RUNS_LOG_DIR, { recursive: true });
        acquireRunsIndexLock();
        lockAcquired = true;
        const snapshot = readRunsIndex();
        const previous = snapshot[runId];

        const taskId = typeof runRecord.taskId === "string" && runRecord.taskId.length > 0
            ? runRecord.taskId
            : previous?.taskIds[0] ?? "direct-invocation";
        const role = typeof runRecord.role === "string" && runRecord.role.length > 0
            ? runRecord.role
            : previous?.results[0]?.role ?? "unknown";
        const startedAt = typeof runRecord.startedAt === "string" && runRecord.startedAt.length > 0
            ? runRecord.startedAt
            : previous?.startedAt ?? new Date().toISOString();
        const finishedAt = typeof runRecord.finishedAt === "string" && runRecord.finishedAt.length > 0
            ? runRecord.finishedAt
            : previous?.finishedAt;
        const status = resolveRunStatus(runRecord.status, previous?.status ?? "running");
        const phase = resolveRunPhase(runRecord.phase, previous?.phase);
        const lastHeartbeatAt = typeof runRecord.lastHeartbeatAt === "string" && runRecord.lastHeartbeatAt.length > 0
            ? runRecord.lastHeartbeatAt
            : previous?.lastHeartbeatAt;
        const progressLogPath = typeof runRecord.progressLogPath === "string" && runRecord.progressLogPath.length > 0
            ? runRecord.progressLogPath
            : previous?.progressLogPath;
        const semanticProgressSupported = typeof runRecord.semanticProgressSupported === "boolean"
            ? runRecord.semanticProgressSupported
            : previous?.semanticProgressSupported;
        const semanticProgressLogPath = typeof runRecord.semanticProgressLogPath === "string" && runRecord.semanticProgressLogPath.length > 0
            ? runRecord.semanticProgressLogPath
            : previous?.semanticProgressLogPath;
        const error = typeof runRecord.error === "string" && runRecord.error.length > 0
            ? runRecord.error
            : undefined;
        const challenge = typeof runRecord.challenge === "string" && runRecord.challenge.length > 0
            ? runRecord.challenge
            : undefined;

        const taskStatus: RunTaskStatus =
            status === "done"
                ? "done"
                : status === "pending-clarification"
                    ? "needs-clarification"
                    : "failed";
        const results: RunTaskResult[] = status === "running"
            ? previous?.results ?? []
            : [{
                taskId,
                role,
                status: taskStatus,
                ...(error ? { error } : {}),
                ...(challenge ? { challenge } : {}),
            }];

        snapshot[runId] = {
            runId,
            startedAt,
            ...(finishedAt ? { finishedAt } : {}),
            status,
            ...(phase ? { phase } : {}),
            ...(lastHeartbeatAt ? { lastHeartbeatAt } : {}),
            ...(progressLogPath ? { progressLogPath } : {}),
            ...(typeof semanticProgressSupported === "boolean" ? { semanticProgressSupported } : {}),
            ...(semanticProgressLogPath ? { semanticProgressLogPath } : {}),
            taskIds: [taskId],
            results,
            pendingClarification: status === "pending-clarification" ? [taskId] : [],
        };

        writeJsonAtomic(RUNS_INDEX_PATH, snapshot);
    } catch (err) {
        console.error("[run-agent] Warning: could not persist runs index:", err);
    } finally {
        if (lockAcquired) {
            releaseRunsIndexLock();
        }
    }
}

/** Persist a single run record to per-run JSON and maintain runs.json index. */
function persistRun(record: Record<string, unknown>): void {
    try {
        const id = record.runId;
        if (typeof id !== "string" || id.length === 0) {
            throw new Error("persistRun requires a string runId");
        }

        mkdirSync(RUNS_LOG_DIR, { recursive: true });
        const path = runLogPath(id);
        let prior: Record<string, unknown> = {};
        if (existsSync(path)) {
            try { prior = JSON.parse(readFileSync(path, "utf-8")); } catch { /* corrupt — reset */ }
        }
        const next = { ...prior, ...record };
        writeFileSync(path, JSON.stringify(next, null, 2), "utf-8");
        persistRunsIndex(next);
    } catch (err) {
        console.error("[run-agent] Warning: could not persist run log:", err);
    }
}

/** Retry an async fn up to maxRetries times with exponential backoff. */
async function withRetry<T>(
    fn: () => Promise<T>,
    maxRetries: number,
    baseMs: number,
    label: string,
    shouldRetry: (err: unknown) => boolean
): Promise<T> {
    let lastErr: unknown;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (err) {
            lastErr = err;
            if (attempt < maxRetries && shouldRetry(err)) {
                const delay = baseMs * Math.pow(2, attempt - 1);
                console.error(`[run-agent] ${label} failed (attempt ${attempt}/${maxRetries}), retrying in ${delay}ms…`);
                await new Promise((r) => setTimeout(r, delay));
            } else {
                throw err;
            }
        }
    }
    throw lastErr;
}

function isRetryableSendAndWaitError(err: unknown): boolean {
    const message = err instanceof Error ? err.message : String(err);
    return /(429|rate limit|timeout|timed out|ECONNRESET|EAI_AGAIN|ENOTFOUND|ENETUNREACH|503|Service Unavailable)/i.test(message);
}

function injectAsyncRunContext(prompt: string, runContext: AsyncRunContext): string {
    const sections = [prompt];

    if (!/##\s*Agent Provenance/i.test(prompt)) {
        sections.push(
            "",
            "## Agent Provenance",
            "",
            `run-id: ${runContext.runId}`,
            `task-id: ${runContext.taskId}`,
            `role: ${runContext.role}`,
            `dispatched: ${runContext.startedAt}`,
            `model: ${runContext.model}`,
        );
    }

    if (!/##\s*Async Run Context/i.test(prompt)) {
        sections.push(
            "",
            "## Async Run Context",
            "",
            `progress-log-path: ${runContext.progressLogPath}`,
            "progress-log-format: jsonl (one JSON object per line)",
            "wrapper-progress: scripts/run-agent.ts appends lifecycle events to this file automatically",
            "path-guarantee: this absolute path stays valid even if you change working directories or move into a sibling worktree",
        );
    }

    if (runContext.agentMilestonesSupported && !/##\s*Optional Agent Milestones/i.test(prompt)) {
        sections.push(
            "",
            "## Optional Agent Milestones",
            "",
            `semantic-progress-log-path: ${runContext.semanticProgressLogPath ?? "(not provisioned)"}`,
            "instruction: if your tool surface allows workspace file writes, append concise markdown bullet milestones to the semantic progress file",
            "suggested-markdown: - [2026-05-07T10:55:28.607Z] Implemented validation wiring",
            "scope: task-specific milestones only; wrapper lifecycle events already go to the JSONL progress log",
            "fallback: do not block or fail the task if you cannot update this optional file",
        );
    }

    return sections.join("\n");
}

function inferTaskId(prompt: string, explicitTaskId?: string): string {
    if (explicitTaskId && explicitTaskId.trim().length > 0) {
        return explicitTaskId.trim();
    }
    const issueUrlMatch = prompt.match(/github\.com\/[^/\s]+\/[^/\s]+\/issues\/(\d+)/i);
    if (issueUrlMatch) return `#${issueUrlMatch[1]}`;

    const issueRefMatch = prompt.match(/(?:^|\s)#(\d+)(?:\b|$)/);
    if (issueRefMatch) return `#${issueRefMatch[1]}`;

    return "direct-invocation";
}

function detectNeedsClarification(output: string): boolean {
    return /build readiness\s*:\s*needs clarification/i.test(output);
}

function extractChallenge(output: string): string {
    const match = output.match(
        /(?:open questions|needs clarification|blockers?)[^\n]*\n([\s\S]{1,800}?)(?:\n#{1,3} |\n---|\n\*\*\*|$)/i
    );
    return match ? match[1].trim() : output.slice(0, 600).trim();
}

// ── Run ───────────────────────────────────────────────────────────────────────

const runId = randomUUID();
const startedAt = new Date().toISOString();
const taskId = inferTaskId(prompt, taskIdArg);
const progressLogPath = runProgressLogPath(runId);
logInfo(`[run-agent] started  runId=${runId} role=${role} model=${model} at=${startedAt}`);
logInfo(`[run-agent] routing  policy-model=${policyModel} policy-source=${policyModelSelection.source} model-source=${modelSource}`);
if (!modelOverride && policyModelSelection.source === "fallback") {
    logInfo(`[run-agent] warning  unknown role='${role}' not found in routing table; using fallback model=${policyModel}`);
}
logInfo(`[run-agent] prompt   ${prompt.slice(0, 120).replace(/\n/g, " ")}${prompt.length > 120 ? "…" : ""}`);
logInfo(`[run-agent] progress ${progressLogPath}`);

const { tools, systemMessage } = readAgentMeta(role);
const mcpServers = resolveAgentMcpServers(tools);
const mcpKeys = Object.keys(mcpServers);
const agentMilestonesSupported = supportsAgentMilestones(tools);
const semanticProgressLogPath = agentMilestonesSupported ? runSemanticProgressLogPath(runId) : undefined;
const asyncRunContext: AsyncRunContext = {
    runId,
    role,
    model,
    startedAt,
    taskId,
    progressLogPath,
    agentMilestonesSupported,
    ...(semanticProgressLogPath ? { semanticProgressLogPath } : {}),
};
logInfo(`[run-agent] tools    ${tools.length > 0 ? tools.join(", ") : "(none)"}`);
for (const [k, v] of Object.entries(mcpServers)) {
    const { headers, ...rest } = v as any;
    const headerKeys = headers ? Object.keys(headers as Record<string, string>) : [];
    logInfo(
        `[run-agent] mcp-cfg  ${k} => ${JSON.stringify({
            ...rest,
            ...(headerKeys.length > 0 ? { headers: "<redacted>", headerKeys } : {}),
        })}`
    );
}
logInfo(`[run-agent] mcp      ${mcpKeys.length > 0 ? mcpKeys.join(", ") : "(none)"}`);
logInfo(`[run-agent] system   ${systemMessage.slice(0, 80).replace(/\n/g, " ")}…`);
logInfo(`[run-agent] flags    no-intro=${noIntro} output-format=${outputFormat}`);
if (semanticProgressLogPath) {
    logInfo(`[run-agent] semantic-progress ${semanticProgressLogPath}`);
}

ensureProgressLog(asyncRunContext);
ensureSemanticProgressLog(asyncRunContext);
persistRun({
    runId,
    taskId,
    role,
    model,
    prompt: prompt.slice(0, 200),
    startedAt,
    status: "running",
    progressLogPath,
    semanticProgressSupported: agentMilestonesSupported,
    ...(semanticProgressLogPath ? { semanticProgressLogPath } : {}),
    phase: "dispatched",
    lastHeartbeatAt: startedAt,
});
recordRunProgress(asyncRunContext, "dispatched", "Run registered and awaiting Copilot session setup.", startedAt);

let exitCode = 0;
const client = new CopilotClient();
let session: Awaited<ReturnType<CopilotClient["createSession"]>> | undefined;
let resolvedReasoningEffort: ReasoningEffort | undefined;
let resolvedReasoningEffortSource: ReasoningEffortSource | undefined;
let modelLookupStatus: "ok" | "failed" = "ok";
let modelLookupError: string | undefined;

try {
    await client.start();
    let availableModels: Awaited<ReturnType<CopilotClient["listModels"]>> = [];
    try {
        availableModels = await client.listModels();
    } catch (error) {
        modelLookupStatus = "failed";
        modelLookupError = error instanceof Error ? error.message : String(error);
        logInfo(`[run-agent] models   failed to list models; using fallback metadata. error=${modelLookupError}`);
        persistRun({ runId, taskId, modelLookupStatus, modelLookupError });
    }
    const reasoningEffortSelection = reasoningEffortSelectionForModel(model, availableModels);
    const reasoningEffort = reasoningEffortSelection.reasoningEffort;
    resolvedReasoningEffort = reasoningEffort;
    resolvedReasoningEffortSource = reasoningEffortSelection.source;
    const modelLookupRecord = {
        modelLookupStatus,
        ...(modelLookupError ? { modelLookupError } : {}),
    };
    persistRun({
        runId,
        taskId,
        reasoningEffort: resolvedReasoningEffort,
        reasoningEffortSource: resolvedReasoningEffortSource,
        ...modelLookupRecord,
    });
    recordRunProgress(
        asyncRunContext,
        "model-resolved",
        modelLookupStatus === "ok"
            ? `Model ${model} resolved with reasoning effort ${reasoningEffort} (${reasoningEffortSelection.source}).`
            : `Model metadata lookup failed; using reasoning effort ${reasoningEffort} (${reasoningEffortSelection.source}).`,
    );
    logInfo(
        `[run-agent] effort   model=${model} effort=${reasoningEffort} source=${reasoningEffortSelection.source}`
    );
    // approveAll: grants all permission requests automatically.
    // This is safe for trusted local use where the agent roles and MCP servers
    // are fully controlled by the repository owner. Do not use in shared/CI environments.
    session = await client.createSession({
        model,
        reasoningEffort,
        onPermissionRequest: approveAll,
        // Register as a named custom agent so the Copilot UI shows the role identity.
        customAgents: [{
            name: role,
            displayName: role,
            prompt: systemMessage,
        }],
        agent: role,
        ...(mcpKeys.length > 0 ? { mcpServers } : {}),
        // Disable infinite-session compaction loops — run-agent.ts is single-shot.
        infiniteSessions: { enabled: false },
        // Block the SDK's built-in subagent delegation to prevent recursive spawning.
        excludedTools: ["delegate_to_agent", "spawn_agent", "create_agent", "run_agent"],
    });

    logInfo(`[run-agent] session  id=${session.sessionId}`);
    recordRunProgress(asyncRunContext, "session-created", `Copilot session ${session.sessionId} created.`);

    if (preSleepMs > 0) {
        logInfo(`[run-agent] sleeping ${preSleepMs / 1000}s before sending prompt…`);
        recordRunProgress(
            asyncRunContext,
            "waiting-before-send",
            `Pre-sleep enabled for ${preSleepMs / 1000}s before sending the prompt.`,
        );
        await new Promise((resolve) => setTimeout(resolve, preSleepMs));
    }

    const promptWithRunContext = injectAsyncRunContext(prompt, asyncRunContext);
    const finalPrompt = noIntro ? promptWithRunContext : ROLE_INTRO_PREFIX + promptWithRunContext;
    const runSession = session;
    recordRunProgress(asyncRunContext, "waiting-for-agent", "Prompt sent to agent; waiting for the final response.");
    const result = await withRetry(
        () => runSession.sendAndWait({ prompt: finalPrompt }, TIMEOUT_MS),
        MAX_RETRIES,
        RETRY_BASE_MS,
        "sendAndWait",
        isRetryableSendAndWaitError
    );
    const output = result?.data?.content ?? "(no output)";
    const needsClarification = detectNeedsClarification(output);
    const challenge = needsClarification ? extractChallenge(output) : undefined;
    const status: RunStatus = needsClarification ? "pending-clarification" : "done";
    const phase: RunPhase = needsClarification ? "needs-clarification" : "completed";

    const finishedAt = new Date().toISOString();
    persistRun({
        runId,
        taskId,
        status,
        phase,
        finishedAt,
        output,
        ...(challenge ? { challenge } : {}),
        reasoningEffort: resolvedReasoningEffort,
        reasoningEffortSource: resolvedReasoningEffortSource,
        modelLookupStatus,
        ...(modelLookupError ? { modelLookupError } : {}),
    });
    recordRunProgress(
        asyncRunContext,
        phase,
        needsClarification
            ? "Agent returned a needs-clarification result."
            : "Agent returned a final response.",
        finishedAt,
    );
    logInfo(`[run-agent] finished at=${finishedAt}`);

    if (outputFormat === "json") {
        process.stdout.write(
            JSON.stringify({
                runId,
                role,
                model,
                reasoningEffort: resolvedReasoningEffort,
                reasoningEffortSource: resolvedReasoningEffortSource,
                modelLookupStatus,
                ...(modelLookupError ? { modelLookupError } : {}),
                startedAt,
                finishedAt,
                status,
                phase,
                progressLogPath,
                semanticProgressSupported: agentMilestonesSupported,
                ...(semanticProgressLogPath ? { semanticProgressLogPath } : {}),
                ...(challenge ? { challenge } : {}),
                output,
            }) + "\n"
        );
    } else {
        logInfo("\n── Agent output ─────────────────────────────────────────────────────────────\n");
        logInfo(output);
        logInfo("\n─────────────────────────────────────────────────────────────────────────────");
    }

} catch (err) {
    const finishedAt = new Date().toISOString();
    persistRun({
        runId,
        taskId,
        status: "failed",
        phase: "failed",
        finishedAt,
        error: err instanceof Error ? err.message : String(err),
        reasoningEffort: resolvedReasoningEffort,
        reasoningEffortSource: resolvedReasoningEffortSource,
        modelLookupStatus,
        ...(modelLookupError ? { modelLookupError } : {}),
    });
    recordRunProgress(
        asyncRunContext,
        "failed",
        err instanceof Error ? err.message : String(err),
        finishedAt,
    );
    console.error(`[run-agent] failed:`, err instanceof Error ? err.message : err);
    exitCode = 1;
} finally {
    if (session) {
        try { await session.disconnect(); } catch { /* non-fatal */ }
    }
    try { await client.stop(); } catch { /* non-fatal */ }
}

process.exitCode = exitCode;
