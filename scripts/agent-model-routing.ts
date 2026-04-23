export const FALLBACK_MODEL = "gpt-5.4";

export type ReasoningEffort = "low" | "medium" | "high" | "xhigh";

export const FALLBACK_REASONING_EFFORT: ReasoningEffort = "high";
const ALL_REASONING_EFFORTS: readonly ReasoningEffort[] = ["low", "medium", "high", "xhigh"];

const REASONING_EFFORT_PRIORITY: Record<ReasoningEffort, number> = {
    low: 0,
    medium: 1,
    high: 2,
    xhigh: 3,
};

export type ModelReasoningSupport = {
    id: string;
    supportedReasoningEfforts?: readonly ReasoningEffort[];
    capabilities?: {
        supports?: {
            reasoning_effort?: readonly string[];
        };
    };
};

export type ReasoningEffortSource = "supported-efforts" | "fallback";

export type ReasoningEffortSelection = {
    reasoningEffort: ReasoningEffort;
    source: ReasoningEffortSource;
};

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

export function reasoningEffortSelectionForModel(
    model: string,
    availableModels?: readonly ModelReasoningSupport[]
): ReasoningEffortSelection {
    const modelInfo = availableModels?.find((candidate) => candidate.id === model);
    const supportedReasoningEffortSet = new Set<ReasoningEffort>();

    for (const effort of modelInfo?.supportedReasoningEfforts ?? []) {
        if (ALL_REASONING_EFFORTS.includes(effort)) {
            supportedReasoningEffortSet.add(effort);
        }
    }

    for (const effort of modelInfo?.capabilities?.supports?.reasoning_effort ?? []) {
        if (ALL_REASONING_EFFORTS.includes(effort as ReasoningEffort)) {
            supportedReasoningEffortSet.add(effort as ReasoningEffort);
        }
    }

    const supportedReasoningEfforts = Array.from(supportedReasoningEffortSet);

    if (!supportedReasoningEfforts || supportedReasoningEfforts.length === 0) {
        return {
            reasoningEffort: FALLBACK_REASONING_EFFORT,
            source: "fallback",
        };
    }

    const highestSupportedReasoningEffort = supportedReasoningEfforts.reduce((highest, candidate) => {
        return REASONING_EFFORT_PRIORITY[candidate] > REASONING_EFFORT_PRIORITY[highest]
            ? candidate
            : highest;
    }, supportedReasoningEfforts[0]);

    return {
        reasoningEffort: highestSupportedReasoningEffort,
        source: "supported-efforts",
    };
}