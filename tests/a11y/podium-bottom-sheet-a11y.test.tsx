import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { PodiumBottomSheet } from '../../src/components/PodiumBottomSheet';

describe('PodiumBottomSheet accessibility semantics', () => {
    it('does not render in DOM when isOpen is false', () => {
        render(
            <PodiumBottomSheet
                isOpen={false}
                selectedSide="tark"
                onSideChange={() => {}}
                onPublish={() => {}}
                onClose={() => {}}
            />
        );

        expect(screen.queryByRole('dialog', { name: 'Post composer' })).not.toBeInTheDocument();
    });

    it('open state exposes dialog role, modal semantics, and label', () => {
        render(
            <PodiumBottomSheet
                isOpen
                selectedSide="tark"
                onSideChange={() => {}}
                onPublish={() => {}}
                onClose={() => {}}
            />
        );

        const dialog = screen.getByRole('dialog', { name: 'Post composer' });
        expect(dialog).toHaveAttribute('aria-modal', 'true');
        expect(dialog).toHaveAttribute('aria-label', 'Post composer');
    });

    it('moves focus to first interactive element when opened', async () => {
        render(
            <PodiumBottomSheet
                isOpen
                selectedSide="tark"
                onSideChange={() => {}}
                onPublish={() => {}}
                onClose={() => {}}
            />
        );

        const closeButton = screen.getByRole('button', { name: 'Close post composer' });
        await waitFor(() => {
            expect(closeButton).toHaveFocus();
        });
    });

    it('keeps tab focus within the sheet boundary', async () => {
        const user = userEvent.setup();
        render(
            <>
                <button type="button">Outside before</button>
                <PodiumBottomSheet
                    isOpen
                    selectedSide="tark"
                    onSideChange={() => {}}
                    onPublish={() => {}}
                    onClose={() => {}}
                />
                <button type="button">Outside after</button>
            </>
        );

        const closeButton = screen.getByRole('button', { name: 'Close post composer' });
        const publishButton = screen.getByRole('button', { name: 'Publish post' });

        await waitFor(() => {
            expect(closeButton).toHaveFocus();
        });

        publishButton.focus();
        await user.tab();

        expect(closeButton).toHaveFocus();
        expect(screen.getByRole('button', { name: 'Outside after' })).not.toHaveFocus();
    });

    it('Shift+Tab from first element wraps focus to last element', async () => {
        const user = userEvent.setup();
        render(
            <PodiumBottomSheet
                isOpen
                selectedSide="tark"
                onSideChange={() => {}}
                onPublish={() => {}}
                onClose={() => {}}
            />
        );

        const closeButton = screen.getByRole('button', { name: 'Close post composer' });
        const publishButton = screen.getByRole('button', { name: 'Publish post' });

        await waitFor(() => {
            expect(closeButton).toHaveFocus();
        });

        await user.tab({ shift: true });
        expect(publishButton).toHaveFocus();
    });

    it('Escape key triggers onClose', async () => {
        const user = userEvent.setup();
        const onClose = vi.fn();

        render(
            <PodiumBottomSheet
                isOpen
                selectedSide="tark"
                onSideChange={() => {}}
                onPublish={() => {}}
                onClose={onClose}
            />
        );

        await user.keyboard('{Escape}');
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('scrim is hidden from assistive technologies', () => {
        render(
            <PodiumBottomSheet
                isOpen
                selectedSide="tark"
                onSideChange={() => {}}
                onPublish={() => {}}
                onClose={() => {}}
            />
        );

        expect(screen.getByTestId('podium-sheet-scrim')).toHaveAttribute('aria-hidden', 'true');
    });

    it('validation error announces via alert + polite live region', async () => {
        const user = userEvent.setup();
        render(
            <PodiumBottomSheet
                isOpen
                selectedSide="tark"
                onSideChange={() => {}}
                onPublish={() => {}}
                onClose={() => {}}
            />
        );

        await user.click(screen.getByRole('button', { name: 'Publish post' }));

        const validationAlert = screen.getByRole('alert');
        expect(validationAlert).toHaveAttribute('aria-live', 'polite');
        expect(validationAlert).toHaveTextContent('Text cannot be empty or whitespace only.');
    });

    it('textarea sets aria-invalid=true when validation error is present', async () => {
        const user = userEvent.setup();
        render(
            <PodiumBottomSheet
                isOpen
                selectedSide="tark"
                onSideChange={() => {}}
                onPublish={() => {}}
                onClose={() => {}}
            />
        );

        await user.click(screen.getByRole('button', { name: 'Publish post' }));

        expect(screen.getByRole('textbox', { name: 'Post text' })).toHaveAttribute('aria-invalid', 'true');
    });
});
