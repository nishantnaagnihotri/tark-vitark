#!/usr/bin/env tsx
/**
 * refresh-figma-token.ts — Exchange the Figma OAuth refresh token for a new
 * access token and write it back to local.env.
 *
 * Usage (run from workspace root):
 *   set -a && source local.env && set +a
 *   npx tsx scripts/refresh-figma-token.ts
 *
 * Reads from env:
 *   FIGMA_REFRESH_TOKEN   — the refresh token (figur_…)
 *   FIGMA_CLIENT_ID       — OAuth client ID registered by VS Code
 *   FIGMA_CLIENT_SECRET   — OAuth client secret registered by VS Code
 *
 * Writes back to local.env:
 *   FIGMA_OAUTH_TOKEN     — new access token (figu_…)
 *   FIGMA_REFRESH_TOKEN   — new refresh token if the server rotates it
 */

import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const WORKSPACE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const LOCAL_ENV_PATH = resolve(WORKSPACE_ROOT, "local.env");
const TOKEN_ENDPOINT = "https://api.figma.com/v1/oauth/token";

// ── Validate required env vars ────────────────────────────────────────────────

const refreshToken = process.env.FIGMA_REFRESH_TOKEN;
const clientId = process.env.FIGMA_CLIENT_ID;
const clientSecret = process.env.FIGMA_CLIENT_SECRET;

if (!refreshToken || !clientId || !clientSecret) {
    console.error(
        "[refresh-figma-token] Missing required env vars.\n" +
        "  Run: set -a && source local.env && set +a\n" +
        "  Then: npx tsx scripts/refresh-figma-token.ts"
    );
    process.exit(1);
}

// ── Exchange refresh token ─────────────────────────────────────────────────────

console.log("[refresh-figma-token] Requesting new access token...");

const body = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
});

const response = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
});

if (!response.ok) {
    const text = await response.text();
    console.error(`[refresh-figma-token] HTTP ${response.status}: ${text}`);
    process.exit(1);
}

interface TokenResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
    refresh_token?: string;
}

const data = (await response.json()) as TokenResponse;

if (!data.access_token) {
    console.error("[refresh-figma-token] No access_token in response:", JSON.stringify(data));
    process.exit(1);
}

// ── Patch local.env in place ───────────────────────────────────────────────────

let envText = readFileSync(LOCAL_ENV_PATH, "utf-8");

function setEnvVar(text: string, key: string, value: string): string {
    const re = new RegExp(`^${key}=.*$`, "m");
    const line = `${key}=${value}`;
    return re.test(text) ? text.replace(re, line) : `${text.trimEnd()}\n${line}\n`;
}

envText = setEnvVar(envText, "FIGMA_OAUTH_TOKEN", data.access_token);

if (data.refresh_token && data.refresh_token !== refreshToken) {
    envText = setEnvVar(envText, "FIGMA_REFRESH_TOKEN", data.refresh_token);
    console.log("[refresh-figma-token] Refresh token rotated — updated FIGMA_REFRESH_TOKEN.");
}

writeFileSync(LOCAL_ENV_PATH, envText, "utf-8");

const expiresInDays = Math.round(data.expires_in / 86400);
console.log(
    `[refresh-figma-token] Done. New access token written to local.env (expires in ~${expiresInDays} days).`
);
console.log(`[refresh-figma-token] Token prefix: ${data.access_token.slice(0, 12)}…`);
