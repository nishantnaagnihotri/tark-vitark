import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { PodiumFAB } from '../../src/components/PodiumFAB';

function MobileComposerHarness({ isMobile }: { isMobile: boolean }) {
    if (!isMobile) {
        return <section aria-label="Desktop composer surface">Desktop composer</section>;
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

function ExpandableFabHarness() {
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

describe('PodiumFAB accessibility contract', () => {
    it('scenario 1: collapsed FAB exposes accessible collapsed state', () => {
        render(
            <PodiumFAB
                isExpanded={false}
                onExpand={() => {}}
                onSideSelect={() => {}}
                onCollapse={() => {}}
            />
        );

        const openButton = screen.getByRole('button', { name: 'Open post composer' });
        expect(openButton).toHaveAttribute('aria-label', 'Open post composer');
        expect(openButton).toHaveAttribute('aria-expanded', 'false');
    });

    it('scenario 2: expand action transitions composer group to expanded ARIA state', async () => {
        const user = userEvent.setup();
        render(<ExpandableFabHarness />);

        await user.click(screen.getByRole('button', { name: 'Open post composer' }));

        const composerGroup = screen.getByRole('group', { name: 'Post composer options', hidden: true });
        await waitFor(() => {
            expect(composerGroup).toHaveAttribute('aria-hidden', 'false');
        });
    });

    it('scenario 3: expanded mini buttons expose correct aria labels', () => {
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

    it('scenario 4: dismiss mini button exposes aria-label="Close"', () => {
        render(
            <PodiumFAB
                isExpanded
                onExpand={() => {}}
                onSideSelect={() => {}}
                onCollapse={() => {}}
            />
        );

        const dismissButton = screen.getByRole('button', { name: 'Close' });
        expect(dismissButton).toHaveAttribute('aria-label', 'Close');
    });

    it('scenario 5: FAB is absent on desktop (isMobile=false)', () => {
        render(<MobileComposerHarness isMobile={false} />);

        expect(screen.queryByRole('button', { name: 'Open post composer' })).not.toBeInTheDocument();
        expect(screen.queryByRole('group', { name: 'Post composer options', hidden: true })).not.toBeInTheDocument();
        expect(screen.getByLabelText('Desktop composer surface')).toBeInTheDocument();
    });
});
