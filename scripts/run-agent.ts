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
 *   --model <model-id>      Override the role default model (fallback: gpt-5.4)
 *   --task-id <task-id>     Optional issue/task reference for provenance block
 *   --allow-agent-orchestrator-mcp
 *                           Allow attaching the agent-orchestrator MCP server (disabled by default)
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
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, resolve } from "node:path";
import { randomUUID } from "node:crypto";
import { modelSelectionForRole } from "./agent-model-routing.ts";

// ── Config ────────────────────────────────────────────────────────────────────

const REASONING_EFFORT = "high" as const;
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

function resolveAgentMcpServers(
    agentTools: string[],
    allowAgentOrchestratorMcp: boolean
): Record<string, MCPServerConfig> {
    if (agentTools.length === 0) return {};

    let rawRegistry: Record<string, any> = {};
    try {
        rawRegistry = JSON.parse(readFileSync(MCP_CONFIG_PATH, "utf-8")).servers ?? {};
    } catch {
        return {};
    }

    const result: Record<string, MCPServerConfig> = {};
    for (const [serverKey, rawConfig] of Object.entries(rawRegistry)) {
        if (!allowAgentOrchestratorMcp && serverKey === "agent-orchestrator") continue;

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

        result[serverKey] = config as MCPServerConfig;
    }
    return result;
}

// ── Args ──────────────────────────────────────────────────────────────────────

let preSleepMs = 0;
let noIntro = false;
let modelOverride: string | undefined;
let taskIdArg: string | undefined;
let allowAgentOrchestratorMcp = false;
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
    } else if (argv[i] === "--allow-agent-orchestrator-mcp") {
        allowAgentOrchestratorMcp = true;
        argv.splice(i, 1);
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
        "[--model <id>] [--task-id <id>] [--allow-agent-orchestrator-mcp] " +
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

/** Persist a single run record to the per-run JSON log file (append/update). */
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

function injectDevAgentProvenanceBlock(prompt: string, runContext: {
    runId: string;
    role: string;
    model: string;
    startedAt: string;
    taskId: string;
}): string {
    if (runContext.role !== "dev" || /##\s*Agent Provenance/i.test(prompt)) {
        return prompt;
    }
    return [
        prompt,
        "",
        "## Agent Provenance",
        "",
        `run-id: ${runContext.runId}`,
        `task-id: ${runContext.taskId}`,
        "role: dev",
        `dispatched: ${runContext.startedAt}`,
        `model: ${runContext.model}`,
    ].join("\n");
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

// ── Run ───────────────────────────────────────────────────────────────────────

const runId = randomUUID();
const startedAt = new Date().toISOString();
logInfo(`[run-agent] started  runId=${runId} role=${role} model=${model} effort=${REASONING_EFFORT} at=${startedAt}`);
logInfo(`[run-agent] routing  policy-model=${policyModel} policy-source=${policyModelSelection.source} model-source=${modelSource}`);
if (!modelOverride && policyModelSelection.source === "fallback") {
    logInfo(`[run-agent] warning  unknown role='${role}' not found in routing table; using fallback model=${policyModel}`);
}
logInfo(`[run-agent] prompt   ${prompt.slice(0, 120).replace(/\n/g, " ")}${prompt.length > 120 ? "…" : ""}`);

const { tools, systemMessage } = readAgentMeta(role);
const mcpServers = resolveAgentMcpServers(tools, allowAgentOrchestratorMcp);
const mcpKeys = Object.keys(mcpServers);
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

persistRun({ runId, role, model, prompt: prompt.slice(0, 200), startedAt, status: "running" });

let exitCode = 0;
const client = new CopilotClient();
let session: Awaited<ReturnType<CopilotClient["createSession"]>> | undefined;

try {
    await client.start();
    // approveAll: grants all permission requests automatically.
    // This is safe for trusted local use where the agent roles and MCP servers
    // are fully controlled by the repository owner. Do not use in shared/CI environments.
    session = await client.createSession({
        model,
        reasoningEffort: REASONING_EFFORT,
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

    if (preSleepMs > 0) {
        logInfo(`[run-agent] sleeping ${preSleepMs / 1000}s before sending prompt…`);
        await new Promise((resolve) => setTimeout(resolve, preSleepMs));
    }

    const taskId = inferTaskId(prompt, taskIdArg);
    const promptWithProvenance = injectDevAgentProvenanceBlock(prompt, {
        runId,
        role,
        model,
        startedAt,
        taskId,
    });
    const finalPrompt = noIntro ? promptWithProvenance : ROLE_INTRO_PREFIX + promptWithProvenance;
    const result = await withRetry(
        () => session.sendAndWait({ prompt: finalPrompt }, TIMEOUT_MS),
        MAX_RETRIES,
        RETRY_BASE_MS,
        "sendAndWait",
        isRetryableSendAndWaitError
    );
    const output = result?.data?.content ?? "(no output)";

    const finishedAt = new Date().toISOString();
    persistRun({ runId, status: "done", finishedAt, output });
    logInfo(`[run-agent] finished at=${finishedAt}`);

    if (outputFormat === "json") {
        process.stdout.write(
            JSON.stringify({ runId, role, model, startedAt, finishedAt, status: "done", output }) + "\n"
        );
    } else {
        logInfo("\n── Agent output ─────────────────────────────────────────────────────────────\n");
        logInfo(output);
        logInfo("\n─────────────────────────────────────────────────────────────────────────────");
    }

} catch (err) {
    const finishedAt = new Date().toISOString();
    persistRun({ runId, status: "failed", finishedAt, error: err instanceof Error ? err.message : String(err) });
    console.error(`[run-agent] failed:`, err instanceof Error ? err.message : err);
    exitCode = 1;
} finally {
    if (session) {
        try { await session.disconnect(); } catch { /* non-fatal */ }
    }
    try { await client.stop(); } catch { /* non-fatal */ }
}

process.exitCode = exitCode;
