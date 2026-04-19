import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { PodiumBottomSheet } from '../../src/components/PodiumBottomSheet';

describe('PodiumBottomSheet accessibility contract', () => {
    it('scenario 6: closed sheet is not rendered', () => {
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

    it('scenario 7: open sheet exposes required dialog attributes', () => {
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

    it('scenario 8: focus moves to first interactive element when sheet opens', async () => {
        render(
            <PodiumBottomSheet
                isOpen
                selectedSide="tark"
                onSideChange={() => {}}
                onPublish={() => {}}
                onClose={() => {}}
            />
        );

        await waitFor(() => {
            expect(screen.getByRole('button', { name: 'Close post composer' })).toHaveFocus();
        });
    });

    it('scenario 9: tab navigation remains trapped inside the sheet', async () => {
        const user = userEvent.setup();
        render(
            <>
                <button type="button">Outside focus target</button>
                <PodiumBottomSheet
                    isOpen
                    selectedSide="tark"
                    onSideChange={() => {}}
                    onPublish={() => {}}
                    onClose={() => {}}
                />
            </>
        );

        const closeButton = screen.getByRole('button', { name: 'Close post composer' });
        const publishButton = screen.getByRole('button', { name: 'Publish post' });
        const outsideButton = screen.getByRole('button', { name: 'Outside focus target' });

        await waitFor(() => {
            expect(closeButton).toHaveFocus();
        });

        publishButton.focus();
        await user.tab();

        expect(closeButton).toHaveFocus();
        expect(outsideButton).not.toHaveFocus();
    });

    it('scenario 10: Shift+Tab from first element wraps to last element', async () => {
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

    it('scenario 11: Escape key closes the sheet', () => {
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

        fireEvent.keyDown(screen.getByRole('dialog', { name: 'Post composer' }), { key: 'Escape' });
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('scenario 12: scrim is hidden from the accessibility tree', () => {
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

    it('scenario 13: error message uses alert role and polite live region', () => {
        render(
            <PodiumBottomSheet
                isOpen
                selectedSide="tark"
                onSideChange={() => {}}
                onPublish={() => {}}
                onClose={() => {}}
            />
        );

        const textarea = screen.getByRole('textbox', { name: 'Post text' });
        const publishButton = screen.getByRole('button', { name: 'Publish post' });

        fireEvent.change(textarea, { target: { value: '   ' } });
        fireEvent.click(publishButton);

        const errorMessage = screen.getByRole('alert');
        expect(errorMessage).toHaveAttribute('aria-live', 'polite');
    });

    it('scenario 14: textarea marks aria-invalid=true when validation error is present', () => {
        render(
            <PodiumBottomSheet
                isOpen
                selectedSide="tark"
                onSideChange={() => {}}
                onPublish={() => {}}
                onClose={() => {}}
            />
        );

        const textarea = screen.getByRole('textbox', { name: 'Post text' });
        const publishButton = screen.getByRole('button', { name: 'Publish post' });

        fireEvent.change(textarea, { target: { value: '   ' } });
        fireEvent.click(publishButton);

        expect(textarea).toHaveAttribute('aria-invalid', 'true');
    });
});
