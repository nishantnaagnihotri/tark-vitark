import { beforeEach, describe, expect, it } from 'vitest';
import type { Argument, Debate } from '../../src/data/debate';
import {
    ACTIVE_DEBATE_RECORD_VERSION,
    ACTIVE_DEBATE_STORAGE_KEY,
    appendActiveDebateArgument,
    clearActiveDebate,
    createEmptyStoredActiveDebateRecord,
    loadStoredActiveDebateRecord,
    replaceActiveDebate,
    saveActiveDebate,
    type StoredActiveDebateRecord,
} from '../../src/lib/activeDebateStorage';
import {
    activeDebateFixture,
    createStoredActiveDebateFixtureRecord,
} from '../fixtures/activeDebateFixture';

function cloneDebate(activeDebate: Debate): Debate {
    return {
        topic: activeDebate.topic,
        arguments: activeDebate.arguments.map((argument) => ({ ...argument })),
    };
}

function createUnavailableStorage(): Storage {
    const throwUnavailable = () => {
        throw new Error('Storage unavailable');
    };

    return {
        get length() {
            throwUnavailable();
            return 0;
        },
        clear: throwUnavailable,
        getItem: throwUnavailable,
        key: throwUnavailable,
        removeItem: throwUnavailable,
        setItem: throwUnavailable,
    } as unknown as Storage;
}

function createMemoryStorage(): Storage {
    const values = new Map<string, string>();

    return {
        get length() {
            return values.size;
        },
        clear() {
            values.clear();
        },
        getItem(key) {
            return values.get(key) ?? null;
        },
        key(index) {
            return Array.from(values.keys())[index] ?? null;
        },
        removeItem(key) {
            values.delete(key);
        },
        setItem(key, value) {
            values.set(key, value);
        },
    };
}

describe('active debate storage foundation', () => {
    let storage: Storage;

    beforeEach(() => {
        storage = createMemoryStorage();
    });

    it('AC-33: stores one versioned active debate record under the single storage key', () => {
        const saveResult = saveActiveDebate(cloneDebate(activeDebateFixture), storage);

        expect(saveResult.ok).toBe(true);
        expect(storage.length).toBe(1);
        expect(storage.getItem(ACTIVE_DEBATE_STORAGE_KEY)).toEqual(
            JSON.stringify(createStoredActiveDebateFixtureRecord()),
        );
    });

    it('AC-33: loads the saved active debate record from storage', () => {
        storage.setItem(
            ACTIVE_DEBATE_STORAGE_KEY,
            JSON.stringify(createStoredActiveDebateFixtureRecord()),
        );

        const loadResult = loadStoredActiveDebateRecord(storage);

        expect(loadResult.state).toBe('loaded');
        expect(loadResult.record).toEqual(createStoredActiveDebateFixtureRecord());
    });

    it('AC-34: replace rewrites the full record with a fresh topic and no carried arguments', () => {
        storage.setItem(
            ACTIVE_DEBATE_STORAGE_KEY,
            JSON.stringify(createStoredActiveDebateFixtureRecord()),
        );

        const replaceResult = replaceActiveDebate('Should public transport be free?', storage);
        const storedPayload = storage.getItem(ACTIVE_DEBATE_STORAGE_KEY);

        expect(replaceResult.ok).toBe(true);
        expect(storedPayload).toEqual(
            JSON.stringify({
                version: ACTIVE_DEBATE_RECORD_VERSION,
                activeDebate: {
                    topic: 'Should public transport be free?',
                    arguments: [],
                },
            } satisfies StoredActiveDebateRecord),
        );
    });

    it('AC-34: clear rewrites the record with no active debate payload', () => {
        storage.setItem(
            ACTIVE_DEBATE_STORAGE_KEY,
            JSON.stringify(createStoredActiveDebateFixtureRecord()),
        );

        const clearResult = clearActiveDebate(storage);
        const storedPayload = storage.getItem(ACTIVE_DEBATE_STORAGE_KEY);

        expect(clearResult.ok).toBe(true);
        expect(storedPayload).toEqual(
            JSON.stringify({
                version: ACTIVE_DEBATE_RECORD_VERSION,
                activeDebate: null,
            } satisfies StoredActiveDebateRecord),
        );
    });

    it('AC-38: append rewrites the full record with the new argument at the tail', () => {
        storage.setItem(
            ACTIVE_DEBATE_STORAGE_KEY,
            JSON.stringify(createStoredActiveDebateFixtureRecord()),
        );
        const newArgument: Argument = {
            id: 9,
            side: 'tark',
            text: 'Public transport reduces emissions and lowers household transport costs.',
        };

        const appendResult = appendActiveDebateArgument(newArgument, storage);
        const loadResult = loadStoredActiveDebateRecord(storage);

        expect(appendResult.ok).toBe(true);
        expect(loadResult.record.activeDebate?.arguments).toHaveLength(
            activeDebateFixture.arguments.length + 1,
        );
        expect(loadResult.record.activeDebate?.arguments.at(-1)).toEqual(newArgument);
    });

    it('AC-39: corrupt JSON resolves to a safe empty result without throwing', () => {
        storage.setItem(ACTIVE_DEBATE_STORAGE_KEY, '{"version":1');

        const loadResult = loadStoredActiveDebateRecord(storage);

        expect(loadResult.state).toBe('corrupt-payload');
        expect(loadResult.record).toEqual(createEmptyStoredActiveDebateRecord());
    });

    it('AC-39: invalid payload shape resolves to a safe empty result', () => {
        storage.setItem(
            ACTIVE_DEBATE_STORAGE_KEY,
            JSON.stringify({
                version: ACTIVE_DEBATE_RECORD_VERSION,
                activeDebate: { topic: 99, arguments: 'invalid' },
            }),
        );

        const loadResult = loadStoredActiveDebateRecord(storage);

        expect(loadResult.state).toBe('corrupt-payload');
        expect(loadResult.record).toEqual(createEmptyStoredActiveDebateRecord());
    });

    it('AC-39: normalizes legacy empty-topic payloads to null activeDebate on load', () => {
        storage.setItem(
            ACTIVE_DEBATE_STORAGE_KEY,
            JSON.stringify({
                version: ACTIVE_DEBATE_RECORD_VERSION,
                activeDebate: {
                    topic: '   ',
                    arguments: [],
                },
            } satisfies StoredActiveDebateRecord),
        );

        const loadResult = loadStoredActiveDebateRecord(storage);

        expect(loadResult.state).toBe('loaded');
        expect(loadResult.record).toEqual(createEmptyStoredActiveDebateRecord());
        expect(storage.getItem(ACTIVE_DEBATE_STORAGE_KEY)).toEqual(
            JSON.stringify(createEmptyStoredActiveDebateRecord()),
        );
    });

    it('AC-39: unavailable storage load fails closed to the safe empty record', () => {
        const unavailableStorage = createUnavailableStorage();

        const loadResult = loadStoredActiveDebateRecord(unavailableStorage);

        expect(loadResult.state).toBe('storage-unavailable');
        expect(loadResult.record).toEqual(createEmptyStoredActiveDebateRecord());
    });

    it('AC-39: unavailable storage write operations fail closed without pretending success', () => {
        const unavailableStorage = createUnavailableStorage();
        const saveResult = saveActiveDebate(cloneDebate(activeDebateFixture), unavailableStorage);
        const replaceResult = replaceActiveDebate(
            'Should every city prioritize cycling lanes?',
            unavailableStorage,
        );
        const appendResult = appendActiveDebateArgument(
            {
                id: 1,
                side: 'vitark',
                text: 'Cycling lanes can reduce road capacity for emergency access in dense zones.',
            },
            unavailableStorage,
        );

        expect(saveResult).toEqual({
            ok: false,
            reason: 'storage-unavailable',
            record: createEmptyStoredActiveDebateRecord(),
        });
        expect(replaceResult).toEqual({
            ok: false,
            reason: 'storage-unavailable',
            record: createEmptyStoredActiveDebateRecord(),
        });
        expect(appendResult).toEqual({
            ok: false,
            reason: 'storage-unavailable',
            record: createEmptyStoredActiveDebateRecord(),
        });
    });

    it('AC-33: append fails closed when no active debate exists in storage', () => {
        storage.setItem(
            ACTIVE_DEBATE_STORAGE_KEY,
            JSON.stringify(createEmptyStoredActiveDebateRecord()),
        );

        const appendResult = appendActiveDebateArgument(
            {
                id: 1,
                side: 'tark',
                text: 'A topic must exist before arguments can be appended.',
            },
            storage,
        );

        expect(appendResult).toEqual({
            ok: false,
            reason: 'active-debate-missing',
            record: createEmptyStoredActiveDebateRecord(),
        });
    });
});
