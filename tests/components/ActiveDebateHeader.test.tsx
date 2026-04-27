import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ActiveDebateHeader } from '../../src/components/ActiveDebateHeader';

const activeDebateHeaderCss = readFileSync(
    resolve(process.cwd(), 'src/styles/components/active-debate-header.css'),
    'utf-8'
);

describe('ActiveDebateHeader', () => {
    it('AC-34: renders active debate topic with integrated header actions', () => {
        render(
            <ActiveDebateHeader
                topic="Should artificial intelligence be regulated by international law?"
                onStartNewDebate={vi.fn()}
            />
        );

        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
            'Should artificial intelligence be regulated by international law?'
        );
        expect(screen.getByRole('switch', { name: /dark mode/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Open debate actions' })).toBeInTheDocument();
    });

    it('AC-34: exposes a single New Debate action from overflow chrome', () => {
        const onStartNewDebate = vi.fn();
        render(
            <ActiveDebateHeader
                topic="Should artificial intelligence be regulated by international law?"
                onStartNewDebate={onStartNewDebate}
            />
        );

        fireEvent.click(screen.getByRole('button', { name: 'Open debate actions' }));
        fireEvent.click(screen.getByRole('button', { name: 'New Debate' }));

        expect(onStartNewDebate).toHaveBeenCalledTimes(1);
        expect(screen.queryByRole('button', { name: 'New Debate' })).not.toBeInTheDocument();
    });

    it('AC-36: keeps header action touch targets at 48px minimum', () => {
        expect(activeDebateHeaderCss).toMatch(
            /\.active-debate-header__theme-action,\s*\.active-debate-header__overflow-trigger\s*\{[^}]*width:\s*var\(--space-12\);[^}]*height:\s*var\(--space-12\);[^}]*min-height:\s*var\(--space-12\);/s
        );
    });
});
