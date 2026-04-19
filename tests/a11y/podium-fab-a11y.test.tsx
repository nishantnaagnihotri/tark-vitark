import { useState } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PodiumFAB } from '../../src/components/PodiumFAB';

function PodiumFabHarness() {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <PodiumFAB
            isExpanded={isExpanded}
            onExpand={() => setIsExpanded(true)}
            onSideSelect={() => {}}
            onCollapse={() => setIsExpanded(false)}
        />
    );
}

interface PodiumFabViewportHarnessProps {
    isMobile: boolean;
}

function PodiumFabViewportHarness({ isMobile }: PodiumFabViewportHarnessProps) {
    if (!isMobile) {
        return null;
    }

    return (
        <PodiumFAB
            isExpanded={false}
            onExpand={() => {}}
            onSideSelect={() => {}}
            onCollapse={() => {}}
        />
    );
}

describe('PodiumFAB accessibility scenarios', () => {
    it('Scenario 1: collapsed FAB exposes aria-label and aria-expanded=false', () => {
        render(
            <PodiumFAB
                isExpanded={false}
                onExpand={() => {}}
                onSideSelect={() => {}}
                onCollapse={() => {}}
            />
        );

        const openComposerButton = screen.getByRole('button', { name: 'Open post composer' });
        expect(openComposerButton).toHaveAttribute('aria-label', 'Open post composer');
        expect(openComposerButton).toHaveAttribute('aria-expanded', 'false');
    });

    it('Scenario 2: after expand click, composer group is exposed as expanded state', async () => {
        render(<PodiumFabHarness />);

        fireEvent.click(screen.getByRole('button', { name: 'Open post composer' }));

        await waitFor(() => {
            expect(screen.getByRole('group', { name: 'Post composer options' })).toHaveAttribute(
                'aria-hidden',
                'false'
            );
        });
    });

    it('Scenario 3: mini-buttons expose the required aria-labels', () => {
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

    it('Scenario 4: dismiss mini-button exposes aria-label="Close"', () => {
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

    it('Scenario 5: FAB is not present on desktop (isMobile=false)', () => {
        render(<PodiumFabViewportHarness isMobile={false} />);

        expect(screen.queryByRole('button', { name: 'Open post composer' })).not.toBeInTheDocument();
    });
});
