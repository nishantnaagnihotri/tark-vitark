import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ThemeToggle } from '../../src/components/ThemeToggle';

describe('ThemeToggle', () => {
    beforeEach(() => {
        document.documentElement.removeAttribute('data-theme');
        sessionStorage.clear();
    });

    it('renders a switch with accessible label', () => {
        render(<ThemeToggle />);
        expect(screen.getByRole('switch', { name: /dark mode/i })).toBeInTheDocument();
    });

    it('does not set data-theme on first render without stored value', () => {
        render(<ThemeToggle />);
        expect(document.documentElement.getAttribute('data-theme')).toBeNull();
    });

    it('sets data-theme on first render when sessionStorage has a value', () => {
        sessionStorage.setItem('tark-vitark:theme', 'light');
        render(<ThemeToggle />);
        expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });

    it('toggles theme on click', () => {
        render(<ThemeToggle />);
        const button = screen.getByRole('switch');
        const initial = document.documentElement.getAttribute('data-theme');

        fireEvent.click(button);

        const toggled = document.documentElement.getAttribute('data-theme');
        expect(toggled).not.toBe(initial);
        expect(toggled).toMatch(/^(light|dark)$/);
    });

    it('persists theme choice in sessionStorage', () => {
        render(<ThemeToggle />);
        const button = screen.getByRole('switch');

        fireEvent.click(button);

        const stored = sessionStorage.getItem('tark-vitark:theme');
        expect(stored).toMatch(/^(light|dark)$/);
        expect(stored).toBe(document.documentElement.getAttribute('data-theme'));
    });

    it('restores theme from sessionStorage', () => {
        sessionStorage.setItem('tark-vitark:theme', 'dark');
        render(<ThemeToggle />);
        expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('reflects system dark preference in button without setting data-theme', () => {
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
        expect(document.documentElement.getAttribute('data-theme')).toBeNull();
        const button = screen.getByRole('switch');
        expect(button).toHaveAttribute('aria-checked', 'true');
        expect(button).toHaveTextContent('☀️');

        matchMediaSpy.mockRestore();
    });
});
