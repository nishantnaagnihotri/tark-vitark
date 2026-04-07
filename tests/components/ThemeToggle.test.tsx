import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ThemeToggle } from '../../src/components/ThemeToggle';

describe('ThemeToggle', () => {
    beforeEach(() => {
        document.documentElement.removeAttribute('data-theme');
        sessionStorage.clear();
    });

    it('renders a button with accessible label', () => {
        render(<ThemeToggle />);
        expect(screen.getByRole('button', { name: /switch to/i })).toBeInTheDocument();
    });

    it('sets data-theme on html element after render', () => {
        render(<ThemeToggle />);
        expect(document.documentElement.getAttribute('data-theme')).toMatch(
            /^(light|dark)$/
        );
    });

    it('toggles theme on click', () => {
        render(<ThemeToggle />);
        const button = screen.getByRole('button');
        const initial = document.documentElement.getAttribute('data-theme');

        fireEvent.click(button);

        const toggled = document.documentElement.getAttribute('data-theme');
        expect(toggled).not.toBe(initial);
        expect(toggled).toMatch(/^(light|dark)$/);
    });

    it('persists theme choice in sessionStorage', () => {
        render(<ThemeToggle />);
        const button = screen.getByRole('button');

        fireEvent.click(button);

        const stored = sessionStorage.getItem('theme');
        expect(stored).toMatch(/^(light|dark)$/);
        expect(stored).toBe(document.documentElement.getAttribute('data-theme'));
    });

    it('restores theme from sessionStorage', () => {
        sessionStorage.setItem('theme', 'dark');
        render(<ThemeToggle />);
        expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('falls back to prefers-color-scheme: dark when no sessionStorage value', () => {
        const matchMediaSpy = vi.spyOn(window, 'matchMedia').mockImplementation(
            (query: string) =>
                ({
                    matches: query === '(prefers-color-scheme: dark)',
                    media: query,
                    addEventListener: vi.fn(),
                    removeEventListener: vi.fn(),
                    addListener: vi.fn(),
                    removeListener: vi.fn(),
                    onchange: null,
                    dispatchEvent: vi.fn(),
                }) as MediaQueryList
        );

        render(<ThemeToggle />);
        expect(document.documentElement.getAttribute('data-theme')).toBe('dark');

        matchMediaSpy.mockRestore();
    });
});
