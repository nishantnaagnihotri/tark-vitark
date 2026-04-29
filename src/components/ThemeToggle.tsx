import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import '../styles/components/theme-toggle.css';

const THEME_STORAGE_KEY = 'tark-vitark:theme';
type ThemeToggleVariant = 'floating' | 'chrome';

interface ThemeToggleProps {
    variant?: ThemeToggleVariant;
    className?: string;
}

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
    const stored = safeStorageGet(THEME_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark')
        return { theme: stored, explicit: true };

    const existing = document.documentElement.getAttribute('data-theme');
    if (existing === 'light' || existing === 'dark')
        return { theme: existing, explicit: true };

    return { theme: getSystemTheme(), explicit: false };
}

function DarkModeIcon() {
    return (
        <svg
            className="theme-toggle__icon theme-toggle__icon--dark"
            viewBox="0 0 24 24"
            aria-hidden="true"
        >
            <path d="M14.36 2c-4.4 0-7.97 3.56-7.97 7.96 0 4.4 3.57 7.97 7.97 7.97 3.07 0 5.73-1.74 7.06-4.28a9.96 9.96 0 0 1-3.5.63c-5.5 0-9.96-4.46-9.96-9.96 0-1.22.22-2.38.63-3.5A7.89 7.89 0 0 1 14.36 2z" />
        </svg>
    );
}

function LightModeIcon() {
    return (
        <svg
            className="theme-toggle__icon theme-toggle__icon--light"
            viewBox="0 0 24 24"
            aria-hidden="true"
        >
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2.5a.75.75 0 0 1 .75.75v2a.75.75 0 0 1-1.5 0v-2A.75.75 0 0 1 12 2.5zm0 16.25a.75.75 0 0 1 .75.75v2a.75.75 0 0 1-1.5 0v-2a.75.75 0 0 1 .75-.75zm9.5-7.5a.75.75 0 0 1 0 1.5h-2a.75.75 0 0 1 0-1.5h2zm-16.25 0a.75.75 0 0 1 0 1.5h-2a.75.75 0 0 1 0-1.5h2zm12.45-6.7a.75.75 0 0 1 1.06 1.06l-1.42 1.42a.75.75 0 1 1-1.06-1.06l1.42-1.42zm-10.6 10.6a.75.75 0 0 1 1.06 1.06l-1.42 1.42a.75.75 0 0 1-1.06-1.06l1.42-1.42zm12.02 2.48a.75.75 0 0 1-1.06 1.06l-1.42-1.42a.75.75 0 0 1 1.06-1.06l1.42 1.42zm-10.6-10.6a.75.75 0 0 1-1.06 1.06L4.95 6.67a.75.75 0 0 1 1.06-1.06l1.42 1.42z" />
        </svg>
    );
}

export function ThemeToggle({ variant = 'floating', className }: ThemeToggleProps) {
    const [initial] = useState(getInitialTheme);
    const [theme, setTheme] = useState<'light' | 'dark'>(initial.theme);
    const hasExplicitChoice = useRef(initial.explicit);

    useEffect(() => {
        const documentThemeObserver = new MutationObserver(() => {
            const documentTheme = document.documentElement.getAttribute('data-theme');
            if (documentTheme !== 'light' && documentTheme !== 'dark') {
                return;
            }

            setTheme((currentTheme) =>
                currentTheme === documentTheme ? currentTheme : documentTheme
            );
        });

        documentThemeObserver.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme'],
        });

        return () => {
            documentThemeObserver.disconnect();
        };
    }, []);

    useLayoutEffect(() => {
        if (hasExplicitChoice.current) {
            document.documentElement.setAttribute('data-theme', theme);
            safeStorageSet(THEME_STORAGE_KEY, theme);
        }
    }, [theme]);

    const toggle = useCallback(() => {
        hasExplicitChoice.current = true;
        setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
    }, []);

    const themeToggleClassName = ['theme-toggle', `theme-toggle--${variant}`, className]
        .filter(Boolean)
        .join(' ');

    return (
        <button
            type="button"
            role="switch"
            className={themeToggleClassName}
            onClick={toggle}
            aria-label="Dark mode"
            aria-checked={theme === 'dark'}
        >
            {theme === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
        </button>
    );
}
