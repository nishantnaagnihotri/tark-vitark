import { useState } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { PodiumFAB } from '../../src/components/PodiumFAB';

interface PodiumFabHarnessProps {
    isMobile: boolean;
}

function PodiumFabHarness({ isMobile }: PodiumFabHarnessProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    if (!isMobile) {
        return null;
    }

    return (
        <PodiumFAB
            isExpanded={isExpanded}
            onExpand={() => setIsExpanded(true)}
            onSideSelect={() => setIsExpanded(false)}
            onCollapse={() => setIsExpanded(false)}
        />
    );
}

async function expandComposerAndWaitUntilAccessible(user: ReturnType<typeof userEvent.setup>) {
    await user.click(screen.getByRole('button', { name: 'Open post composer' }));

    await waitFor(() => {
        const composerGroup = screen.getByRole('group', { name: 'Post composer options' });
        expect(composerGroup).toHaveAttribute('aria-hidden', 'false');
    });
}

describe('PodiumFAB a11y scenarios', () => {
    it('keeps aria-label and collapsed aria-expanded contract on the closed FAB', () => {
        render(<PodiumFabHarness isMobile />);

        const openComposerButton = screen.getByRole('button', { name: 'Open post composer' });
        expect(openComposerButton).toHaveAttribute('aria-label', 'Open post composer');
        expect(openComposerButton).toHaveAttribute('aria-expanded', 'false');
    });

    it('shows expanded composer group state after expand interaction', async () => {
        const user = userEvent.setup();
        render(<PodiumFabHarness isMobile />);

        await expandComposerAndWaitUntilAccessible(user);
    });

    it('exposes mini-button aria labels for side selection', async () => {
        const user = userEvent.setup();
        render(<PodiumFabHarness isMobile />);

        await expandComposerAndWaitUntilAccessible(user);

        expect(screen.getByRole('button', { name: 'Post as Tark' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Post as Vitark' })).toBeInTheDocument();
    });

    it('exposes aria-label="Close" for the dismiss mini-button', async () => {
        const user = userEvent.setup();
        render(<PodiumFabHarness isMobile />);

        await expandComposerAndWaitUntilAccessible(user);

        expect(screen.getByRole('button', { name: 'Close' })).toHaveAttribute('aria-label', 'Close');
    });

    it('does not render FAB controls when mobile mode is disabled', () => {
        render(<PodiumFabHarness isMobile={false} />);

        expect(screen.queryByRole('button', { name: 'Open post composer' })).not.toBeInTheDocument();
        expect(screen.queryByRole('group', { name: 'Post composer options' })).not.toBeInTheDocument();
    });
});
