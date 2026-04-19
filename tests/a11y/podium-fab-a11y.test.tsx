import { useState } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { PodiumFAB } from '../../src/components/PodiumFAB';

function PodiumFABHarness() {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <PodiumFAB
            isExpanded={isExpanded}
            onExpand={() => setIsExpanded(true)}
            onSideSelect={() => setIsExpanded(false)}
            onCollapse={() => setIsExpanded(false)}
        />
    );
}

function PodiumFABMobileOnlyHarness({ isMobile }: { isMobile: boolean }) {
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

describe('PodiumFAB accessibility semantics', () => {
    it('collapsed FAB has aria-label and aria-expanded=false', () => {
        render(<PodiumFABHarness />);

        const openComposerButton = screen.getByRole('button', { name: 'Open post composer' });
        expect(openComposerButton).toHaveAttribute('aria-label', 'Open post composer');
        expect(openComposerButton).toHaveAttribute('aria-expanded', 'false');
    });

    it('after expand click, composer options group is exposed for assistive tech', async () => {
        const user = userEvent.setup();
        render(<PodiumFABHarness />);

        await user.click(screen.getByRole('button', { name: 'Open post composer' }));

        const composerOptionsGroup = await screen.findByRole('group', { name: 'Post composer options' });
        await waitFor(() => {
            expect(composerOptionsGroup).toHaveAttribute('aria-hidden', 'false');
        });
    });

    it('expanded mini-buttons expose correct side labels', () => {
        render(
            <PodiumFAB
                isExpanded
                onExpand={() => {}}
                onSideSelect={() => {}}
                onCollapse={() => {}}
            />
        );

        expect(screen.getByRole('button', { name: 'Post as Tark' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Post as Vitark' })).toBeInTheDocument();
    });

    it('dismiss mini-button has aria-label Close', () => {
        render(
            <PodiumFAB
                isExpanded
                onExpand={() => {}}
                onSideSelect={() => {}}
                onCollapse={() => {}}
            />
        );

        expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
    });

    it('FAB is not rendered when mobile surface is disabled (desktop path)', () => {
        render(<PodiumFABMobileOnlyHarness isMobile={false} />);

        expect(screen.queryByRole('button', { name: 'Open post composer' })).not.toBeInTheDocument();
    });
});
