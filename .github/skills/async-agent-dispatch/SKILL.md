---
name: async-agent-dispatch
description: "Async agent dispatch workflow: run a single Copilot SDK agent via run-agent.ts, launch parallel async agents for Gate 5 parallel dev dispatch, apply role-based model routing, apply session context prefix for chat traceability, read prompts from files, configure MCP servers via mcp.json, and maintain Figma OAuth token lifecycle. Use when: dispatching any named agent (prd-agent, dev, design-qa-agent, etc.) from the terminal, running Gate 5 parallel dev agents as background processes, tracing async chat sessions back to their originating slice/gate, troubleshooting MCP tool access, or refreshing an expired Figma OAuth token."
---

# Async Agent Dispatch

## When To Use

- Manually dispatching a named agent (e.g. `prd-agent`, `requirement-challenger`, `design-qa-agent`, `dev`) from a terminal without opening a chat window
- Running Gate 5 parallel dev agents as independent background processes (primary use case for `run_in_terminal mode=async`)
- Troubleshooting why an MCP server (Figma, GitHub, Chrome DevTools) is not reachable
- Refreshing an expired Figma OAuth token

## When NOT To Use

- Gates 1–4 orchestration: use `runSubagent` tool (built into VS Code Copilot chat) — output flows directly into conversation context
- Running one-off shell commands unrelated to the agent SDK

---

## Dispatch Mode Decision Rule (Mandatory)

Before every agent dispatch, classify the expected output:

| Output type | Example | Dispatch mode |
|---|---|---|
| GitHub side effect — commits, PR updates, thread replies, issue comments | Dev agent fixing review comments | `run_in_terminal (mode=async)` + `get_terminal_output` |
| Reasoning input — analysis, verdict, pass/fail decision the orchestrator must evaluate immediately | Requirement challenger, PRD agent, design QA agent | `runSubagent` (Gates 1–4 only) |

**Rule:** if the orchestrator does not need to read the agent's output to decide what to do next — because the result is a GitHub artifact verifiable via MCP or PR list — use async terminal dispatch.

**Violation pattern to avoid:** using `runSubagent` to dispatch a dev agent to fix review comments. The commit SHA and thread replies are verifiable on GitHub; they do not need to flow into the orchestrator's reasoning context. Using `runSubagent` in this case blocks the chat session for the full agent duration unnecessarily.

## Role-Based Model Routing (Mandatory)

`scripts/agent-model-routing.ts` is the source of truth for terminal and async role defaults.

| Role | Default model | Typical use |
|---|---|---|
| `architect-orchestrator` | `gpt-5.4` | coordination and gate decisions |
| `requirement-challenger` | `claude-sonnet-4.6` | requirement challenge |
| `prd-agent` | `claude-sonnet-4.6` | PRD drafting |
| `design-qa-agent` | `claude-sonnet-4.6` | design QA critique |
| `architecture-agent` | `gpt-5.4` | architecture reasoning |
| `dev` | `gpt-5.3-codex` | issue-scoped implementation |
| `runtime-qa` | `gpt-5.4` | runtime verdict synthesis |

Rules:

1. Gates 1, 2, 3B, 4, and 5.5 use sync `runSubagent` handoffs; those calls must pass an explicit `model` matching the shared policy.
2. For each sync `runSubagent` handoff, print exactly one sync dispatch banner in chat immediately before the tool call. Include role, explicit model, reasoning status (`tool-controlled / not repo-configurable`), and gate/slice context.
3. `scripts/run-agent.ts` resolves the role default automatically when `--model` is omitted, resolves the highest supported reasoning effort for the selected model via `listModels()`, and logs both the resolved model and whether it came from the role default or an override.
4. `scripts/mcp-dev-orchestrator.ts` uses the same routing table for parallel async runs, includes the resolved model in task status output, and resolves the highest supported reasoning effort for each task's selected model via `listModels()`.
5. If a task genuinely needs a non-default model, dispatch it directly with `scripts/run-agent.ts --model <id>` and record why in the handoff or dispatch note.
6. Before introducing a new live role, add it to `scripts/agent-model-routing.ts` and this table in the same change.
7. For each async `run-agent.ts` dispatch, print exactly one dispatch banner in chat immediately after the dispatch call returns. Include role, model, reasoning effort, effort source (`supported-efforts` or `fallback`), gate/slice context, terminal id, and timestamp.

`runSubagent` sync handoffs currently expose explicit model selection but no repo-controlled reasoning-effort parameter. Keep the model explicit there, print the sync dispatch banner before the tool call, and treat reasoning-effort enforcement as a tool limitation until the chat tool exposes that control.

---

## Core Script

`scripts/run-agent.ts` — single-shot Copilot SDK agent dispatcher.

**Location**: `scripts/run-agent.ts` in the workspace root.

**Dependencies**:
- `@github/copilot-sdk` (consumed from `node_modules`)
- `tsx` — TypeScript executor (via `npx tsx`)
- `scripts/agent-model-routing.ts` — shared role-to-model defaults
- `.github/agents/*.agent.md` — role definitions (name, tools frontmatter, system message body)
- `.vscode/mcp.json` — MCP server registry with `_envHeaders` and `_toolPrefixes` extensions
- `local.env` — local secrets (gitignored); must be sourced before running if any MCP server needs env-based auth

---

## Usage Patterns

> **For terminal-dispatched agents (`scripts/run-agent.ts`, especially Gate 5), always run as async background processes.**
> This callout applies to terminal dispatch only; it does **not** override the Gates 1–4 `runSubagent` sync path in the decision rule above.
> Agent calls take 10–60+ seconds. Running them in the foreground blocks the chat session.
> Use `run_in_terminal (mode=async)` from the agent tool, or append `&` in a shell script.
> Check completion with `get_terminal_output` — you will be notified automatically when the process exits.

### 1. Single agent — async background (preferred)

```bash
# Via shell — background with &
set -a && source local.env && set +a
npx tsx scripts/run-agent.ts <role> "<prompt>" 2>&1 &
echo "[bg] PID=$!"
```

```
# Via run_in_terminal tool — set mode=async
mode: async
command: set -a && source local.env && set +a && npx tsx scripts/run-agent.ts <role> "<prompt>" 2>&1
```

Examples:
```bash
npx tsx scripts/run-agent.ts prd-agent "Draft a PRD for a dark-mode toggle" 2>&1 &
npx tsx scripts/run-agent.ts requirement-challenger "Challenge this requirement: …" 2>&1 &
npx tsx scripts/run-agent.ts design-qa-agent "Review the ThemeToggle component for a11y issues" 2>&1 &
```

### 2. Prompt from file

Prefix the prompt argument with `@` to read from a file:
```bash
npx tsx scripts/run-agent.ts dev @docs/slices/my-slice/06-tasks.md
```

The file path is relative to the current working directory. The file's full contents become the prompt.

### 3. With MCP auth (Figma, GitHub)

Source `local.env` first so `_envHeaders` env-var substitution works:
```bash
set -a && source local.env && set +a
npx tsx scripts/run-agent.ts design-qa-agent "Call the Figma MCP whoami tool."
```

The script expands `$FIGMA_OAUTH_TOKEN` and `$GITHUB_TOKEN` into request headers at runtime. If an env var is unset, the header is skipped **and logged** in `[run-agent] mcp-hdrs … skipped=[…]`, and MCP tool calls will fail with auth errors.

### 4. Parallel async agents

Launch multiple agents concurrently — each as an independent background process. Use `--pre-sleep <seconds>` to stagger LLM calls and avoid simultaneous rate-limit spikes:

```bash
# Each agent runs in its own background process
set -a && source local.env && set +a
npx tsx scripts/run-agent.ts --pre-sleep 0  requirement-challenger "…" 2>&1 &
npx tsx scripts/run-agent.ts --pre-sleep 15 prd-agent "…" 2>&1 &
npx tsx scripts/run-agent.ts --pre-sleep 30 design-qa-agent "…" 2>&1 &
wait  # or poll with get_terminal_output per async terminal ID
```

When using `run_in_terminal (mode=async)`, launch each agent in a **separate** `run_in_terminal` call and capture each terminal ID. Poll them independently with `get_terminal_output`.

The `--pre-sleep` flag delays the LLM call (not process startup). `--pre-sleep 0` is valid and still runs in the background.

### Session Context Prefix — Mandatory for Parallel Dispatch

Every prompt dispatched via `run_in_terminal (mode=async)` **must** begin with a structured context header:

```
[SLICE: <slice-name> | GATE: <N> | <role>]
```

**Why:** VS Code Copilot Chat uses the start of the first user message as the session title. Without this prefix, all concurrent agent sessions look identical and cannot be traced back to the slice or gate that spawned them.

**Also pass `--task-id`** with the same `<slice-name>/<gate>/<role>` value so the run record in `logs/parallel-agents/` carries the same identifier.

Example — three Gate 5 dev agents dispatched in parallel:
```bash
npx tsx scripts/run-agent.ts --task-id debate-screen/gate5/dev-1 dev \
  "[SLICE: debate-screen | GATE: 5 | dev-1] Implement ArgumentCard …" 2>&1 &

npx tsx scripts/run-agent.ts --task-id debate-screen/gate5/dev-2 dev \
  "[SLICE: debate-screen | GATE: 5 | dev-2] Implement LegendBar …" 2>&1 &
```

The VS Code chat panel will show `[SLICE: debate-screen | GATE: 5 | dev-1]` and `[SLICE: debate-screen | GATE: 5 | dev-2]` as session titles, making it immediately obvious which root thread each belongs to.

### 5. Liveness check

Useful for verifying rate-limit headroom before a long parallel run:
```bash
npx tsx scripts/run-agent.ts requirement-challenger "Reply with exactly: ALIVE"
```

---

## Sync Dispatch Banner (Mandatory)

Before every sync handoff via `runSubagent`, output exactly one sync dispatch banner.

Use this format:

```
---
🤝 SYNC DISPATCH — <role>
Model: <display-model>
Reasoning: tool-controlled / not repo-configurable
Gate <N> | Slice: <slice-name>
---
```

All values must be real:
- `role`: the specialist role being invoked via `runSubagent`
- `display-model`: the exact explicit model label passed to `runSubagent`
- `Gate <N> | Slice: <slice-name>`: the current gate number and slice being worked on; use `N/A` if dispatched outside a gate context

Rules:
- Emit the banner immediately before the `runSubagent` call.
- Do not invent a repo-controlled reasoning level for sync handoffs.
- Do not add async-only fields such as terminal id or timestamp to the sync banner.

## Single Async Dispatch Banner (Mandatory)

After every async agent dispatch via `run_in_terminal (mode=async)`, output exactly one dispatch banner.

**Immediately before dispatching, run two commands to capture the timestamps needed for the banner and session-memory table:**

```
TZ=Asia/Kolkata date "+%H:%M %Z"       # HH:MM IST — for the dispatch banner
TZ=Asia/Kolkata date "+%Y-%m-%dT%H:%M:%S+05:30"   # ISO timestamp — for the dispatched column
```

Then dispatch the agent. Then output the single dispatch banner — no exceptions:

```
---
🤖 AGENT DISPATCHED — <role>
Model: <model-id>
Reasoning: <reasoning-effort> (source: <supported-efforts|fallback>)
Gate <N> | Slice: <slice-name>
Terminal: <terminal-id> | <HH:MM IST>
---
```

All values must be real:
- `role`: the agent role argument passed to `run-agent.ts`
- `model`: the resolved model used for this dispatch (or documented override)
- `reasoning`: the resolved reasoning effort and source used for this dispatch
- `Gate <N> | Slice: <slice-name>`: the current gate number and slice being worked on; use `N/A` if dispatched outside a gate context
- `terminal`: the exact UUID returned by `run_in_terminal` — not fabricated, not guessed
- `HH:MM IST`: derived from the actual `date` output — not calculated from context

Rules:
- Values must reflect the same role/model/reasoning path used in the dispatch command.
- If a model override is used (`--model`), the banner must show the override and the reason.
- If live model metadata is unavailable at dispatch time, use `Reasoning: high (source: fallback)` and state that metadata lookup was unavailable.

**Fabricating banner values is a protocol violation. Omitting the banner is a protocol violation.**

Immediately after outputting the dispatch banner, record the dispatch in `/memories/session/active-state.md` under `## Pending Async Runs`:

```
| terminal-id | dispatched | issue | purpose | status |
|---|---|---|---|---|
| <terminal-id> | <YYYY-MM-DDTHH:MM:SS+05:30> | #<n> (or N/A) | <role> — <one-line task description> | running |
```

Both steps (dispatch banner + session memory update) must complete before any other action.

---

## How MCP Servers Are Wired

`resolveAgentMcpServers()` in `run-agent.ts` cross-references the agent's `tools` list (parsed from its `.agent.md` frontmatter) against `.vscode/mcp.json`:

1. Each `mcp.json` entry may have two private extensions:
   - `_toolPrefixes`: `string[]` — prefixes used to match agent tool names (e.g. `["com.figma.mcp"]`). If omitted, the server key itself is used.
   - `_envHeaders`: `Record<string,string>` — HTTP headers with `$VAR_NAME` placeholders expanded from `process.env`.
2. A server is included for an agent only if at least one of the agent's tools starts with a `_toolPrefixes` entry.
3. `tools: ["*"]` is injected automatically so all tools on the matched server are available.
4. Resolved headers are logged as `[run-agent] mcp-hdrs <server>: resolved=[…] skipped=[…]` — check this line to confirm auth is flowing and to see which headers were skipped due to missing/invalid env substitutions.

### Adding a new MCP server

1. Add an entry to `.vscode/mcp.json` with `_toolPrefixes` and `_envHeaders` as needed.
2. Add the corresponding env var to `local.env`.
3. Add the tool prefix to the relevant agent's `tools` list in its `.agent.md` frontmatter.

---

## MCP Auth Maintenance — Figma OAuth Token

### Token facts

| Property | Value |
|---|---|
| Token type | OAuth 2.0 Bearer (`figu_…`) |
| Lifetime | ~90 days (`expires_in: 7776000` seconds) |
| Refresh token | `figur_…` — stored in `local.env` as `FIGMA_REFRESH_TOKEN` |
| Token endpoint | `https://api.figma.com/v1/oauth/token` |
| Auth method | `client_secret_post` (credentials in POST body, not Basic header) |
| Client registration | VS Code Figma extension — `FIGMA_CLIENT_ID` / `FIGMA_CLIENT_SECRET` in `local.env` |

### When to refresh

- Any Figma MCP call returns `401 Unauthorized` or `403 Forbidden`
- `[run-agent] mcp-hdrs` log line shows `resolved=[none] skipped=[Authorization]` (token missing or invalid after substitution)
- More than ~85 days since last refresh (proactive)

### How to refresh

```bash
# 1. Source credentials
set -a && source local.env && set +a

# 2. Run the refresh script
npx tsx scripts/refresh-figma-token.ts
```

The script (`scripts/refresh-figma-token.ts`):
- POSTs `grant_type=refresh_token` to `https://api.figma.com/v1/oauth/token`
- Patches `FIGMA_OAUTH_TOKEN` in `local.env` in-place
- Patches `FIGMA_REFRESH_TOKEN` in `local.env` if the server rotates it
- Prints the new token expiry

### Verify after refresh

```bash
set -a && source local.env && set +a
npx tsx scripts/run-agent.ts design-qa-agent "Call the Figma MCP whoami tool and return exactly what it gives you."
```

Expected output includes `"email": "…"` and `"handle": "…"`. Any error at this step means the token exchange failed — check `local.env` manually.

### How the original token was obtained

VS Code's Figma extension stores the OAuth token in VS Code's safeStorage. **Linux-specific note:** one common location is `~/.config/Code/User/globalStorage/state.vscdb` (with keys managed via the desktop keyring). On macOS/Windows, storage paths and keychain mechanisms differ. If a full re-authentication is needed (e.g. both access and refresh tokens are invalid), the simplest path is to re-authorize via the VS Code Figma extension in the GUI and then re-extract.

---

## MCP Auth Maintenance — GitHub Token

### Token facts

| Property | Value |
|---|---|
| Token type | Personal access token-style bearer (`gho_…`) |
| Source | `gh` CLI OAuth login (`gh auth login`) |
| Refresh model | No built-in auto-refresh; re-authentication mints a new token |
| Storage | `local.env` as `GITHUB_TOKEN` |
| Consumer | GitHub MCP `_envHeaders` expansion in `.vscode/mcp.json` |

### When to refresh

- Any GitHub MCP call returns `401 Unauthorized` or `403 Forbidden`
- `[run-agent] mcp-hdrs` log line shows `resolved=[none] skipped=[Authorization]` for the GitHub server (the `GITHUB_TOKEN` env var is empty, unset, or invalid)

### How to refresh

```bash
gh auth login      # re-authenticate via browser
gh auth token      # print new token
# then update local.env: GITHUB_TOKEN=<new token>
```

After updating `local.env`, re-source env vars before dispatching agents:

```bash
set -a && source local.env && set +a
```

### Verify after refresh

```bash
set -a && source local.env && set +a
npx tsx scripts/run-agent.ts dev "Call the GitHub MCP get_me tool and return exactly what it gives you."
```

Expected output includes your GitHub `login`. Any auth error at this step means `GITHUB_TOKEN` is still invalid or unset.

---

## Log Reference

| Log prefix | Meaning |
|---|---|
| `[run-agent] started` | Process launched; shows role, model, timestamp |
| `[run-agent] mcp-hdrs <server>: resolved=[Authorization] skipped=[none]` | Auth header resolved from env — MCP server will receive it |
| `[run-agent] mcp-hdrs <server>: resolved=[none] skipped=[Authorization]` | `_envHeaders` env var is unset/invalid; source `local.env` |
| `[run-agent] tools` | Full list of tools the agent declared in its `.agent.md` |
| `[run-agent] mcp-cfg` | Resolved MCP server config (`headers` logged as `"<redacted>"` with `headerKeys`) |
| `[run-agent] session` | Session ID from Copilot SDK |
| `[run-agent] finished` | Agent completed; output follows in `── Agent output ──` block |

---

## Known Limits and Anti-Patterns

- **Do not nest agents**: `delegate_to_agent`, `spawn_agent`, `create_agent`, and `run_agent` are excluded tools. `run-agent.ts` also excludes the `agent-orchestrator` MCP server by default; only enable it with `--allow-agent-orchestrator-mcp` when explicitly required.
- **Single-shot only**: `infiniteSessions: { enabled: false }` — the session ends after one turn. For multi-turn workflows, invoke the script multiple times.
- **Timeout and retries**: `sendAndWait` uses a 1-hour timeout per attempt with up to 3 attempts (plus retry backoff and optional `--pre-sleep`), so worst-case runtime can exceed 1 hour.
- **No stdin**: The script does not accept interactive input. The full prompt must be in the argument or a file.
- **`local.env` is gitignored**: Never commit it. If secrets are lost, re-extract from VS Code safeStorage or re-authorize via the extension GUI.
