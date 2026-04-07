import { useCallback, useLayoutEffect, useState } from 'react';
import '../styles/components/theme-toggle.css';

function getInitialTheme(): 'light' | 'dark' {
    const stored = sessionStorage.getItem('theme');
    if (stored === 'light' || stored === 'dark') return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
}

export function ThemeToggle() {
    const [theme, setTheme] = useState<'light' | 'dark'>(getInitialTheme);

    useLayoutEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        sessionStorage.setItem('theme', theme);
    }, [theme]);

    const toggle = useCallback(() => {
        setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
    }, []);

    return (
        <button
            type="button"
            className="theme-toggle"
            onClick={toggle}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
        >
            {theme === 'light' ? '🌙' : '☀️'}
        </button>
    );
}
