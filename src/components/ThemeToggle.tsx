import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import '../styles/components/theme-toggle.css';

function safeStorageGet(key: string): string | null {
    try {
        return sessionStorage.getItem(key);
    } catch {
        return null;
    }
}

function safeStorageSet(key: string, value: string): void {
    try {
        sessionStorage.setItem(key, value);
    } catch {
        /* storage unavailable — ignore */
    }
}

function getSystemTheme(): 'light' | 'dark' {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
}

function getInitialTheme(): { theme: 'light' | 'dark'; explicit: boolean } {
    const stored = safeStorageGet('theme');
    if (stored === 'light' || stored === 'dark')
        return { theme: stored, explicit: true };

    const existing = document.documentElement.getAttribute('data-theme');
    if (existing === 'light' || existing === 'dark')
        return { theme: existing, explicit: true };

    return { theme: getSystemTheme(), explicit: false };
}

export function ThemeToggle() {
    const [initial] = useState(getInitialTheme);
    const [theme, setTheme] = useState<'light' | 'dark'>(initial.theme);
    const hasExplicitChoice = useRef(initial.explicit);

    useLayoutEffect(() => {
        if (hasExplicitChoice.current) {
            document.documentElement.setAttribute('data-theme', theme);
            safeStorageSet('theme', theme);
        }
    }, [theme]);

    const toggle = useCallback(() => {
        hasExplicitChoice.current = true;
        setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
    }, []);

    return (
        <button
            type="button"
            className="theme-toggle"
            onClick={toggle}
            aria-label="Toggle theme"
            aria-pressed={theme === 'dark'}
        >
            {theme === 'light' ? '🌙' : '☀️'}
        </button>
    );
}
