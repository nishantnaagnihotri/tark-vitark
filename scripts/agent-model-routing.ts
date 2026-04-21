export const FALLBACK_MODEL = "gpt-5.4";

export const ROLE_DEFAULT_MODELS = {
    "architect-orchestrator": "gpt-5.4",
    "requirement-challenger": "claude-sonnet-4.6",
    "prd-agent": "claude-sonnet-4.6",
    "design-qa-agent": "claude-sonnet-4.6",
    "architecture-agent": "gpt-5.4",
    dev: "gpt-5.3-codex",
    "runtime-qa": "gpt-5.4",
    "ux-agent": "claude-sonnet-4.6",
    "figma-agent": "gpt-5.4",
} as const satisfies Record<string, string>;

export function defaultModelForRole(role: string): string {
    return ROLE_DEFAULT_MODELS[role] ?? FALLBACK_MODEL;
}