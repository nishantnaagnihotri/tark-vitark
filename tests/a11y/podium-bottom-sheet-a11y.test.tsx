import type { ComponentProps } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { PodiumBottomSheet } from '../../src/components/PodiumBottomSheet';

function renderBottomSheet(overrides?: Partial<ComponentProps<typeof PodiumBottomSheet>>) {
    const onClose = overrides?.onClose ?? vi.fn();

    const view = render(
        <>
            <button type="button">Outside page control</button>
            <PodiumBottomSheet
                isOpen={overrides?.isOpen ?? true}
                selectedSide={overrides?.selectedSide ?? 'tark'}
                onSideChange={overrides?.onSideChange ?? vi.fn()}
                onPublish={overrides?.onPublish ?? vi.fn()}
                onClose={onClose}
            />
        </>
    );

    return { ...view, onClose };
}

describe('PodiumBottomSheet a11y scenarios', () => {
    it('is not rendered when closed', () => {
        renderBottomSheet({ isOpen: false });

        expect(screen.queryByRole('dialog', { name: 'Post composer' })).not.toBeInTheDocument();
        expect(screen.queryByRole('dialog', { name: 'Post composer', hidden: true })).not.toBeInTheDocument();
        expect(screen.queryByTestId('podium-sheet-scrim')).not.toBeInTheDocument();
    });

    it('renders required dialog role and ARIA attributes when open', () => {
        renderBottomSheet();

        const dialog = screen.getByRole('dialog', { name: 'Post composer' });
        expect(dialog).toHaveAttribute('role', 'dialog');
        expect(dialog).toHaveAttribute('aria-modal', 'true');
        expect(dialog).toHaveAttribute('aria-label', 'Post composer');
    });

    it('moves focus to the first interactive element on open', async () => {
        renderBottomSheet();

        await waitFor(() => {
            expect(screen.getByRole('button', { name: 'Close post composer' })).toHaveFocus();
        });
    });

    it('keeps tab navigation within the dialog boundary', async () => {
        const user = userEvent.setup();
        renderBottomSheet();

        const closeButton = screen.getByRole('button', { name: 'Close post composer' });
        const publishButton = screen.getByRole('button', { name: 'Publish post' });
        const outsidePageControl = screen.getByRole('button', { name: 'Outside page control' });

        await waitFor(() => {
            expect(closeButton).toHaveFocus();
        });

        publishButton.focus();
        await user.tab();

        expect(closeButton).toHaveFocus();
        expect(outsidePageControl).not.toHaveFocus();
    });

    it('moves focus from first element to last on Shift+Tab', async () => {
        const user = userEvent.setup();
        renderBottomSheet();

        const closeButton = screen.getByRole('button', { name: 'Close post composer' });
        const publishButton = screen.getByRole('button', { name: 'Publish post' });

        await waitFor(() => {
            expect(closeButton).toHaveFocus();
        });

        await user.tab({ shift: true });
        expect(publishButton).toHaveFocus();
    });

    it('calls onClose when Escape is pressed inside the dialog', () => {
        const { onClose } = renderBottomSheet();

        fireEvent.keyDown(screen.getByRole('dialog', { name: 'Post composer' }), { key: 'Escape' });

        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('marks the scrim as aria-hidden', () => {
        renderBottomSheet();

        const scrim = screen.getByTestId('podium-sheet-scrim');
        expect(scrim).toHaveAttribute('aria-hidden', 'true');
    });

    it('surfaces errors as polite live alerts', async () => {
        const user = userEvent.setup();
        renderBottomSheet();

        const postTextField = screen.getByRole('textbox', { name: 'Post text' });
        await user.type(postTextField, '   ');
        await user.click(screen.getByRole('button', { name: 'Publish post' }));

        const errorMessage = screen.getByRole('alert');
        expect(errorMessage).toHaveAttribute('role', 'alert');
        expect(errorMessage).toHaveAttribute('aria-live', 'polite');
        expect(errorMessage).toHaveTextContent('Text cannot be empty or whitespace only.');
    });

    it('marks the textarea as aria-invalid when an error is present', async () => {
        const user = userEvent.setup();
        renderBottomSheet();

        const postTextField = screen.getByRole('textbox', { name: 'Post text' });
        await user.type(postTextField, '   ');
        await user.click(screen.getByRole('button', { name: 'Publish post' }));

        expect(postTextField).toHaveAttribute('aria-invalid', 'true');
    });
});
