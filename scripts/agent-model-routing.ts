export const FALLBACK_MODEL = "gpt-5.4";

export const ROLE_DEFAULT_MODELS = {
    "architect-orchestrator": "gpt-5.4",
    "requirement-challenger": "claude-sonnet-4.6",
    "prd-agent": "claude-sonnet-4.6",
    "design-qa-agent": "claude-sonnet-4.6",
    "architecture-agent": "gpt-5.4",
    dev: "gpt-5.3-codex",
    "runtime-qa": "gpt-5.4",
} as const satisfies Record<string, string>;

export type RoleModelSource = "role-default" | "fallback";

export type RoleModelSelection = {
    model: string;
    source: RoleModelSource;
};

export function modelSelectionForRole(role: string): RoleModelSelection {
    if (Object.prototype.hasOwnProperty.call(ROLE_DEFAULT_MODELS, role)) {
        return {
            model: ROLE_DEFAULT_MODELS[role as keyof typeof ROLE_DEFAULT_MODELS],
            source: "role-default",
        };
    }

    return {
        model: FALLBACK_MODEL,
        source: "fallback",
    };
}

export function defaultModelForRole(role: string): string {
    return modelSelectionForRole(role).model;
}