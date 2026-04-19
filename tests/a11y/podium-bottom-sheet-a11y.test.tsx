import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { PodiumBottomSheet } from '../../src/components/PodiumBottomSheet';
import type { Side } from '../../src/data/debate';

interface RenderBottomSheetA11yOptions {
    isOpen?: boolean;
    selectedSide?: Side;
    onSideChange?: (side: Side) => void;
    onPublish?: (text: string, side: Side) => void;
    onClose?: () => void;
}

function renderBottomSheetForA11y(options: RenderBottomSheetA11yOptions = {}) {
    const props = {
        isOpen: options.isOpen ?? true,
        selectedSide: options.selectedSide ?? 'tark',
        onSideChange: options.onSideChange ?? vi.fn(),
        onPublish: options.onPublish ?? vi.fn(),
        onClose: options.onClose ?? vi.fn(),
    };

    render(<PodiumBottomSheet {...props} />);
    return props;
}

describe('PodiumBottomSheet accessibility scenarios', () => {
    it('Scenario 6: closed sheet is not rendered in the DOM', () => {
        renderBottomSheetForA11y({ isOpen: false });

        expect(screen.queryByRole('dialog', { name: 'Post composer' })).not.toBeInTheDocument();
    });

    it('Scenario 7: open sheet exposes dialog semantics and labels', () => {
        renderBottomSheetForA11y();

        const dialog = screen.getByRole('dialog', { name: 'Post composer' });
        expect(dialog).toHaveAttribute('role', 'dialog');
        expect(dialog).toHaveAttribute('aria-modal', 'true');
        expect(dialog).toHaveAttribute('aria-label', 'Post composer');
    });

    it('Scenario 8: focus moves to first interactive element on open', async () => {
        renderBottomSheetForA11y();

        const closeComposerButton = screen.getByRole('button', { name: 'Close post composer' });
        await waitFor(() => {
            expect(closeComposerButton).toHaveFocus();
        });
    });

    it('Scenario 9: Tab navigation cycles within sheet and does not escape', async () => {
        const user = userEvent.setup();

        render(
            <>
                <button type="button">Outside control</button>
                <PodiumBottomSheet
                    isOpen
                    selectedSide="tark"
                    onSideChange={() => {}}
                    onPublish={() => {}}
                    onClose={() => {}}
                />
            </>
        );

        const closeComposerButton = screen.getByRole('button', { name: 'Close post composer' });
        const publishButton = screen.getByRole('button', { name: 'Publish post' });
        const outsideControl = screen.getByRole('button', { name: 'Outside control' });

        publishButton.focus();
        await user.tab();

        expect(closeComposerButton).toHaveFocus();
        expect(outsideControl).not.toHaveFocus();
    });

    it('Scenario 10: Shift+Tab from first element moves focus to last element', async () => {
        const user = userEvent.setup();

        renderBottomSheetForA11y();

        const closeComposerButton = screen.getByRole('button', { name: 'Close post composer' });
        const publishButton = screen.getByRole('button', { name: 'Publish post' });

        closeComposerButton.focus();
        await user.tab({ shift: true });

        expect(publishButton).toHaveFocus();
    });

    it('Scenario 11: Escape key invokes onClose', () => {
        const onClose = vi.fn();
        renderBottomSheetForA11y({ onClose });

        fireEvent.keyDown(screen.getByRole('dialog', { name: 'Post composer' }), { key: 'Escape' });

        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('Scenario 12: scrim is hidden from assistive technologies', () => {
        renderBottomSheetForA11y();

        expect(screen.getByTestId('podium-sheet-scrim')).toHaveAttribute('aria-hidden', 'true');
    });

    it('Scenario 13: validation error element uses role=alert and aria-live=polite', () => {
        renderBottomSheetForA11y();

        const postInput = screen.getByRole('textbox', { name: 'Post text' });
        fireEvent.change(postInput, { target: { value: '   ' } });
        fireEvent.click(screen.getByRole('button', { name: 'Publish post' }));

        const errorMessage = screen.getByRole('alert');
        expect(errorMessage).toHaveAttribute('aria-live', 'polite');
        expect(errorMessage).toHaveTextContent('Text cannot be empty or whitespace only.');
    });

    it('Scenario 14: textarea marks aria-invalid=true when validation error is present', () => {
        renderBottomSheetForA11y();

        const postInput = screen.getByRole('textbox', { name: 'Post text' });
        fireEvent.change(postInput, { target: { value: '   ' } });
        fireEvent.click(screen.getByRole('button', { name: 'Publish post' }));

        expect(postInput).toHaveAttribute('aria-invalid', 'true');
    });
});
