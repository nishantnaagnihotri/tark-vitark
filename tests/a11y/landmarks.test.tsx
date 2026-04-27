import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { DebateScreen } from '../../src/components/DebateScreen';
import {
    activeDebateFixture,
    seedActiveDebateFixture,
} from '../fixtures/activeDebateFixture';

describe('Landmark and heading verification', () => {
    beforeEach(() => {
        seedActiveDebateFixture(window.localStorage);
    });

    it('has a <main> landmark', () => {
        render(<DebateScreen />);
        expect(screen.getByRole('main')).toBeInTheDocument();
    });

    it('has a <nav> landmark with label', () => {
        render(<DebateScreen />);
        const nav = screen.getByRole('navigation', {
            name: 'Debate sides legend',
        });
        expect(nav).toBeInTheDocument();
    });

    it('has a <section> landmark with label for timeline', () => {
        render(<DebateScreen />);
        const section = screen.getByRole('region', {
            name: 'Debate arguments',
        });
        expect(section).toBeInTheDocument();
    });

    it('has a single <h1> heading with the debate topic', () => {
        render(<DebateScreen />);
        const headings = screen.getAllByRole('heading', { level: 1 });
        expect(headings).toHaveLength(1);
        expect(headings[0]).toHaveTextContent(activeDebateFixture.topic);
    });

    it('landmark order is main > header > nav > section', () => {
        const { container } = render(<DebateScreen />);
        const main = container.querySelector('main');
        expect(main).toBeTruthy();

        const children = Array.from(main!.children);
        const tagNames = children.map((el) => el.tagName.toLowerCase());

        // header (contains Topic), nav (LegendBar), section (Timeline)
        expect(tagNames).toContain('header');
        expect(tagNames).toContain('nav');
        expect(tagNames).toContain('section');

        const headerIdx = tagNames.indexOf('header');
        const navIdx = tagNames.indexOf('nav');
        const sectionIdx = tagNames.indexOf('section');
        expect(headerIdx).toBeLessThan(navIdx);
        expect(navIdx).toBeLessThan(sectionIdx);
    });
});

describe('aria-label verification on argument cards', () => {
    beforeEach(() => {
        seedActiveDebateFixture(window.localStorage);
    });

    it('every argument card has an aria-label identifying its side', () => {
        render(<DebateScreen />);

        for (const arg of activeDebateFixture.arguments) {
            const expectedLabel =
                arg.side === 'tark' ? 'Tark argument' : 'Vitark argument';
            const cards = screen.getAllByLabelText(expectedLabel);
            expect(cards.length).toBeGreaterThanOrEqual(1);
        }
    });

    it('tark argument cards have "Tark argument" label', () => {
        render(<DebateScreen />);
        const tarkCards = screen.getAllByLabelText('Tark argument');
        const tarkCount = activeDebateFixture.arguments.filter(
            (a) => a.side === 'tark',
        ).length;
        expect(tarkCards).toHaveLength(tarkCount);
    });

    it('vitark argument cards have "Vitark argument" label', () => {
        render(<DebateScreen />);
        const vitarkCards = screen.getAllByLabelText('Vitark argument');
        const vitarkCount = activeDebateFixture.arguments.filter(
            (a) => a.side === 'vitark',
        ).length;
        expect(vitarkCards).toHaveLength(vitarkCount);
    });
});

describe('Theme switching', () => {
    afterEach(() => {
        document.documentElement.removeAttribute('data-theme');
    });

    it('data-theme="dark" can be set on document root', () => {
        document.documentElement.setAttribute('data-theme', 'dark');
        expect(document.documentElement.getAttribute('data-theme')).toBe(
            'dark',
        );
    });

    it('data-theme="light" can be set on document root', () => {
        document.documentElement.setAttribute('data-theme', 'light');
        expect(document.documentElement.getAttribute('data-theme')).toBe(
            'light',
        );
    });

    it('tokens.css includes [data-theme="dark"] selector', async () => {
        const { readFileSync } = await import('node:fs');
        const { resolve } = await import('node:path');
        const css = readFileSync(
            resolve(process.cwd(), 'src/styles/tokens.css'),
            'utf-8',
        );
        expect(css).toContain('[data-theme="dark"]');
    });

    it('tokens.css includes prefers-color-scheme: dark fallback', async () => {
        const { readFileSync } = await import('node:fs');
        const { resolve } = await import('node:path');
        const css = readFileSync(
            resolve(process.cwd(), 'src/styles/tokens.css'),
            'utf-8',
        );
        expect(css).toMatch(/prefers-color-scheme:\s*dark/);
    });

    it('prefers-color-scheme fallback targets :root:not([data-theme])', async () => {
        const { readFileSync } = await import('node:fs');
        const { resolve } = await import('node:path');
        const css = readFileSync(
            resolve(process.cwd(), 'src/styles/tokens.css'),
            'utf-8',
        );
        expect(css).toContain(':root:not([data-theme])');
    });

    it('component renders under dark theme without errors', () => {
        document.documentElement.setAttribute('data-theme', 'dark');
        const { unmount } = render(<DebateScreen />);
        expect(screen.getByRole('main')).toBeInTheDocument();
        unmount();
    });
});
