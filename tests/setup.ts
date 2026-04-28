// Polyfill window.matchMedia for jsdom (used by ThemeToggle)
if (!window.matchMedia) {
    Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: (query: string) => ({
            matches: false,
            media: query,
            onchange: null,
            addListener: () => {},
            removeListener: () => {},
            addEventListener: () => {},
            removeEventListener: () => {},
            dispatchEvent: () => false,
        }),
    });
}

function createInMemoryStorage(): Storage {
    const values = new Map<string, string>();

    return {
        get length() {
            return values.size;
        },
        clear() {
            values.clear();
        },
        getItem(key: string) {
            return values.get(key) ?? null;
        },
        key(index: number) {
            return Array.from(values.keys())[index] ?? null;
        },
        removeItem(key: string) {
            values.delete(key);
        },
        setItem(key: string, value: string) {
            values.set(key, value);
        },
    };
}

function localStorageNeedsPolyfill(): boolean {
    try {
        const storage = window.localStorage;

        if (
            typeof storage.getItem !== 'function'
            || typeof storage.setItem !== 'function'
            || typeof storage.removeItem !== 'function'
            || typeof storage.clear !== 'function'
        ) {
            return true;
        }

        const probeKey = '__tv_local_storage_probe__';
        storage.setItem(probeKey, probeKey);
        storage.removeItem(probeKey);
        return false;
    } catch {
        return true;
    }
}

const storageNeedsPolyfill = localStorageNeedsPolyfill();

if (storageNeedsPolyfill) {
    Object.defineProperty(window, 'localStorage', {
        configurable: true,
        writable: true,
        value: createInMemoryStorage(),
    });
}
