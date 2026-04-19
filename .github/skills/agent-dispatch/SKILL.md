---
name: agent-dispatch
description: "Agent dispatch workflow: run a single Copilot SDK agent via run-agent.ts, launch parallel async agents for Gate 5 parallel dev dispatch, read prompts from files, configure MCP servers via mcp.json, and maintain Figma OAuth token lifecycle. Use when: dispatching any named agent (prd-agent, dev, design-qa-agent, etc.) from the terminal, running Gate 5 parallel dev agents as background processes, troubleshooting MCP tool access, or refreshing an expired Figma OAuth token."
---

# Agent Dispatch

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

---

## Core Script

`scripts/run-agent.ts` — single-shot Copilot SDK agent dispatcher.

**Location**: `scripts/run-agent.ts` in the workspace root.

**Dependencies**:
- `@github/copilot-sdk` (consumed from `node_modules`)
- `tsx` — TypeScript executor (via `npx tsx`)
- `.github/agents/*.agent.md` — role definitions (name, tools frontmatter, system message body)
- `.vscode/mcp.json` — MCP server registry with `_envHeaders` and `_toolPrefixes` extensions
- `local.env` — local secrets (gitignored); must be sourced before running if any MCP server needs env-based auth

---

## Usage Patterns

> **Always run agents as async background processes.**
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

The script expands `$FIGMA_OAUTH_TOKEN` and `$GITHUB_TOKEN` into request headers at runtime. If an env var is unset, the header is silently dropped and the MCP tool calls will fail with auth errors.

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

### 5. Liveness check

Useful for verifying rate-limit headroom before a long parallel run:
```bash
npx tsx scripts/run-agent.ts requirement-challenger "Reply with exactly: ALIVE"
```

---

## How MCP Servers Are Wired

`resolveAgentMcpServers()` in `run-agent.ts` cross-references the agent's `tools` list (parsed from its `.agent.md` frontmatter) against `.vscode/mcp.json`:

1. Each `mcp.json` entry may have two private extensions:
   - `_toolPrefixes`: `string[]` — prefixes used to match agent tool names (e.g. `["com.figma.mcp"]`). If omitted, the server key itself is used.
   - `_envHeaders`: `Record<string,string>` — HTTP headers with `$VAR_NAME` placeholders expanded from `process.env`.
2. A server is included for an agent only if at least one of the agent's tools starts with a `_toolPrefixes` entry.
3. `tools: ["*"]` is injected automatically so all tools on the matched server are available.
4. Resolved headers are logged as `[run-agent] mcp-hdrs <server>: headers set (…), first value prefix="…"` — check this line to confirm auth is flowing.

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
- `[run-agent] mcp-hdrs` log line shows `first value prefix="Bearer "` (token is empty/unset)
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
- Prints the new token prefix and expiry

### Verify after refresh

```bash
set -a && source local.env && set +a
npx tsx scripts/run-agent.ts design-qa-agent "Call the Figma MCP whoami tool and return exactly what it gives you."
```

Expected output includes `"email": "…"` and `"handle": "…"`. Any error at this step means the token exchange failed — check `local.env` manually.

### How the original token was obtained

VS Code's Figma extension stores the OAuth token in VS Code's safeStorage (AES-128-CBC, Chromium Safe Storage key from GNOME keyring). The DB is at `~/.config/Code/User/globalStorage/state.vscdb`. If a full re-authentication is needed (e.g. both access and refresh tokens are invalid), the simplest path is to re-authorize via the VS Code Figma extension in the GUI and then re-extract.

---

## Log Reference

| Log prefix | Meaning |
|---|---|
| `[run-agent] started` | Process launched; shows role, model, timestamp |
| `[run-agent] mcp-hdrs <server>: headers set (…)` | Auth header resolved from env — MCP server will receive it |
| `[run-agent] mcp-hdrs <server>: no headers resolved` | `_envHeaders` env var is unset; source `local.env` |
| `[run-agent] tools` | Full list of tools the agent declared in its `.agent.md` |
| `[run-agent] mcp-cfg` | Resolved MCP server config (headers masked to 12 chars) |
| `[run-agent] session` | Session ID from Copilot SDK |
| `[run-agent] finished` | Agent completed; output follows in `── Agent output ──` block |

---

## Known Limits and Anti-Patterns

- **Do not nest agents**: `delegate_to_agent`, `spawn_agent`, `create_agent`, and `run_agent` are excluded tools — the SDK will not recursively spawn sub-agents.
- **Single-shot only**: `infiniteSessions: { enabled: false }` — the session ends after one turn. For multi-turn workflows, invoke the script multiple times.
- **Timeout**: 1 hour hard limit. Long tasks must complete within this window.
- **No stdin**: The script does not accept interactive input. The full prompt must be in the argument or a file.
- **`local.env` is gitignored**: Never commit it. If secrets are lost, re-extract from VS Code safeStorage or re-authorize via the extension GUI.
