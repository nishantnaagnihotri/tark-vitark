import type { Argument, Debate, Side } from '../data/debate';

export const ACTIVE_DEBATE_STORAGE_KEY = 'tark-vitark:active-debate';
export const ACTIVE_DEBATE_RECORD_VERSION = 1 as const;

export interface StoredActiveDebateRecord {
    version: typeof ACTIVE_DEBATE_RECORD_VERSION;
    activeDebate: Debate | null;
}

export interface ActiveDebateStorageLoadResult {
    state: 'loaded' | 'corrupt-payload' | 'storage-unavailable';
    record: StoredActiveDebateRecord;
}

export type ActiveDebateStorageWriteResult =
    | {
        ok: true;
        record: StoredActiveDebateRecord;
    }
    | {
        ok: false;
        reason: 'storage-unavailable' | 'active-debate-missing';
        record: StoredActiveDebateRecord;
    };

export function createEmptyStoredActiveDebateRecord(): StoredActiveDebateRecord {
    return {
        version: ACTIVE_DEBATE_RECORD_VERSION,
        activeDebate: null,
    };
}

function resolveStorage(storage?: Storage): Storage | null {
    if (storage) {
        return storage;
    }

    try {
        return window.localStorage;
    } catch {
        return null;
    }
}

function isSide(value: unknown): value is Side {
    return value === 'tark' || value === 'vitark';
}

function isArgument(value: unknown): value is Argument {
    if (typeof value !== 'object' || value === null) {
        return false;
    }

    const candidate = value as {
        id?: unknown;
        side?: unknown;
        text?: unknown;
    };

    return (
        typeof candidate.id === 'number' &&
        Number.isFinite(candidate.id) &&
        isSide(candidate.side) &&
        typeof candidate.text === 'string'
    );
}

function isDebate(value: unknown): value is Debate {
    if (typeof value !== 'object' || value === null) {
        return false;
    }

    const candidate = value as {
        topic?: unknown;
        arguments?: unknown;
    };

    return (
        typeof candidate.topic === 'string' &&
        Array.isArray(candidate.arguments) &&
        candidate.arguments.every((argument) => isArgument(argument))
    );
}

function isStoredActiveDebateRecord(value: unknown): value is StoredActiveDebateRecord {
    if (typeof value !== 'object' || value === null) {
        return false;
    }

    const candidate = value as {
        version?: unknown;
        activeDebate?: unknown;
    };

    return (
        candidate.version === ACTIVE_DEBATE_RECORD_VERSION &&
        (candidate.activeDebate === null || isDebate(candidate.activeDebate))
    );
}

function storageUnavailableResult(): ActiveDebateStorageLoadResult {
    return {
        state: 'storage-unavailable',
        record: createEmptyStoredActiveDebateRecord(),
    };
}

function persistStoredActiveDebateRecord(
    record: StoredActiveDebateRecord,
    storage?: Storage,
): ActiveDebateStorageWriteResult {
    const availableStorage = resolveStorage(storage);
    if (!availableStorage) {
        return {
            ok: false,
            reason: 'storage-unavailable',
            record: createEmptyStoredActiveDebateRecord(),
        };
    }

    try {
        availableStorage.setItem(
            ACTIVE_DEBATE_STORAGE_KEY,
            JSON.stringify(record),
        );
        return { ok: true, record };
    } catch {
        return {
            ok: false,
            reason: 'storage-unavailable',
            record: createEmptyStoredActiveDebateRecord(),
        };
    }
}

export function loadStoredActiveDebateRecord(storage?: Storage): ActiveDebateStorageLoadResult {
    const availableStorage = resolveStorage(storage);
    if (!availableStorage) {
        return storageUnavailableResult();
    }

    let serializedRecord: string | null;
    try {
        serializedRecord = availableStorage.getItem(ACTIVE_DEBATE_STORAGE_KEY);
    } catch {
        return storageUnavailableResult();
    }

    if (serializedRecord === null) {
        return {
            state: 'loaded',
            record: createEmptyStoredActiveDebateRecord(),
        };
    }

    let parsedRecord: unknown;
    try {
        parsedRecord = JSON.parse(serializedRecord);
    } catch {
        return {
            state: 'corrupt-payload',
            record: createEmptyStoredActiveDebateRecord(),
        };
    }

    if (!isStoredActiveDebateRecord(parsedRecord)) {
        return {
            state: 'corrupt-payload',
            record: createEmptyStoredActiveDebateRecord(),
        };
    }

    return {
        state: 'loaded',
        record: parsedRecord,
    };
}

export function saveActiveDebate(
    activeDebate: Debate,
    storage?: Storage,
): ActiveDebateStorageWriteResult {
    return persistStoredActiveDebateRecord(
        {
            version: ACTIVE_DEBATE_RECORD_VERSION,
            activeDebate: {
                topic: activeDebate.topic,
                arguments: activeDebate.arguments.map((argument) => ({ ...argument })),
            },
        },
        storage,
    );
}

export function replaceActiveDebate(
    topic: string,
    storage?: Storage,
): ActiveDebateStorageWriteResult {
    return saveActiveDebate(
        {
            topic,
            arguments: [],
        },
        storage,
    );
}

export function clearActiveDebate(storage?: Storage): ActiveDebateStorageWriteResult {
    return persistStoredActiveDebateRecord(
        {
            version: ACTIVE_DEBATE_RECORD_VERSION,
            activeDebate: null,
        },
        storage,
    );
}

export function appendActiveDebateArgument(
    argument: Argument,
    storage?: Storage,
): ActiveDebateStorageWriteResult {
    const loadResult = loadStoredActiveDebateRecord(storage);
    if (loadResult.state === 'storage-unavailable') {
        return {
            ok: false,
            reason: 'storage-unavailable',
            record: loadResult.record,
        };
    }

    if (!loadResult.record.activeDebate) {
        return {
            ok: false,
            reason: 'active-debate-missing',
            record: loadResult.record,
        };
    }

    return persistStoredActiveDebateRecord(
        {
            version: ACTIVE_DEBATE_RECORD_VERSION,
            activeDebate: {
                topic: loadResult.record.activeDebate.topic,
                arguments: [...loadResult.record.activeDebate.arguments, { ...argument }],
            },
        },
        storage,
    );
}
