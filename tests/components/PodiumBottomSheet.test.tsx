import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PodiumBottomSheet } from '../../src/components/PodiumBottomSheet';
import type { Side } from '../../src/data/debate';

const podiumBottomSheetCss = readFileSync(
    resolve(process.cwd(), 'src/styles/components/podium-bottom-sheet.css'),
    'utf-8'
);

interface RenderBottomSheetOptions {
    isOpen?: boolean;
    selectedSide?: Side;
    onSideChange?: (side: Side) => void;
    onPublish?: (text: string, side: Side) => void;
    onClose?: () => void;
}

function renderBottomSheet(options: RenderBottomSheetOptions = {}) {
    const props = {
        isOpen: options.isOpen ?? true,
        selectedSide: options.selectedSide ?? 'tark',
        onSideChange: options.onSideChange ?? vi.fn(),
        onPublish: options.onPublish ?? vi.fn(),
        onClose: options.onClose ?? vi.fn(),
    };

    const renderResult = render(<PodiumBottomSheet {...props} />);

    return { ...renderResult, ...props };
}

describe('PodiumBottomSheet', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('does not render when isOpen is false', () => {
        renderBottomSheet({ isOpen: false });

        expect(
            screen.queryByRole('dialog', { name: 'Post composer' })
        ).not.toBeInTheDocument();
    });

    it('renders dialog, segmented control, textarea, and publish action when open', () => {
        renderBottomSheet();

        expect(
            screen.getByRole('dialog', { name: 'Post composer' })
        ).toBeInTheDocument();
        expect(screen.getByRole('radiogroup', { name: 'Side selection' })).toBeInTheDocument();
        expect(screen.getByRole('textbox', { name: 'Post text' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Publish post' })).toBeInTheDocument();
    });

    it('sets required dialog accessibility attributes', () => {
        renderBottomSheet();

        const dialog = screen.getByRole('dialog', { name: 'Post composer' });

        expect(dialog).toHaveAttribute('aria-modal', 'true');
        expect(dialog).toHaveAttribute('aria-label', 'Post composer');
    });

    it('delegates side selection changes through SegmentedControl', () => {
        const onSideChange = vi.fn();
        renderBottomSheet({ onSideChange });

        fireEvent.click(screen.getByRole('radio', { name: 'Vitark' }));

        expect(onSideChange).toHaveBeenCalledTimes(1);
        expect(onSideChange).toHaveBeenCalledWith('vitark');
    });

    it('closes on close-button and scrim interactions', () => {
        const onClose = vi.fn();
        renderBottomSheet({ onClose });

        fireEvent.click(screen.getByRole('button', { name: 'Close post composer' }));
        fireEvent.click(screen.getByTestId('podium-sheet-scrim'));

        expect(onClose).toHaveBeenCalledTimes(2);
    });

    it('validates with validatePost on submit and surfaces validation errors', () => {
        const onPublish = vi.fn();
        renderBottomSheet({ onPublish });

        const textarea = screen.getByRole('textbox', { name: 'Post text' });

        fireEvent.change(textarea, { target: { value: '   ' } });
        fireEvent.click(screen.getByRole('button', { name: 'Publish post' }));

        expect(onPublish).not.toHaveBeenCalled();
        expect(screen.getByRole('alert')).toHaveTextContent(
            'Text cannot be empty or whitespace only.'
        );
        expect(textarea).toHaveAttribute('aria-invalid', 'true');
        expect(textarea).toHaveAttribute('aria-describedby', 'sheet-podium-error');
    });

    it('publishes trimmed text with selected side and clears input on success', async () => {
        const onPublish = vi.fn();
        renderBottomSheet({ onPublish, selectedSide: 'vitark' });

        const textarea = screen.getByRole('textbox', { name: 'Post text' });

        fireEvent.change(textarea, {
            target: { value: '   This submission is long enough.   ' },
        });
        fireEvent.click(screen.getByRole('button', { name: 'Publish post' }));

        await waitFor(() => {
            expect(onPublish).toHaveBeenCalledWith('This submission is long enough.', 'vitark');
        });

        expect(textarea).toHaveValue('');
        expect(screen.getByRole('alert')).toHaveTextContent('');
    });

    it('focuses the first interactive element, traps tabbing, and closes on Escape', async () => {
        const user = userEvent.setup();
        const onClose = vi.fn();
        renderBottomSheet({ onClose });

        const closeButton = screen.getByRole('button', { name: 'Close post composer' });
        const publishButton = screen.getByRole('button', { name: 'Publish post' });

        await waitFor(() => {
            expect(closeButton).toHaveFocus();
        });

        await user.tab({ shift: true });
        expect(publishButton).toHaveFocus();

        await user.tab();
        expect(closeButton).toHaveFocus();

        fireEvent.keyDown(screen.getByRole('dialog', { name: 'Post composer' }), {
            key: 'Escape',
        });
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('applies open-state class after mount so enter transition can run', async () => {
        renderBottomSheet();

        const dialog = screen.getByRole('dialog', { name: 'Post composer' });

        expect(dialog).not.toHaveClass('podium-bottom-sheet--open');
        await waitFor(() => {
            expect(dialog).toHaveClass('podium-bottom-sheet--open');
        });
    });

    it('dismisses when dragged beyond threshold and snaps back otherwise', () => {
        vi.stubGlobal('PointerEvent', window.PointerEvent ?? MouseEvent);

        const onClose = vi.fn();
        const { container } = renderBottomSheet({ onClose });
        const dragHandle = container.querySelector('.podium-bottom-sheet__handle') as HTMLDivElement;
        expect(dragHandle).toBeInTheDocument();

        fireEvent.pointerDown(dragHandle, { pointerId: 1, clientY: 100 });
        fireEvent.pointerMove(dragHandle, { pointerId: 1, clientY: 190 });
        fireEvent.pointerUp(dragHandle, { pointerId: 1, clientY: 190 });

        expect(onClose).toHaveBeenCalledTimes(1);

        fireEvent.pointerDown(dragHandle, { pointerId: 2, clientY: 100 });
        fireEvent.pointerMove(dragHandle, { pointerId: 2, clientY: 150 });
        fireEvent.pointerUp(dragHandle, { pointerId: 2, clientY: 150 });

        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('binds all bottom sheet colors and motion properties to design tokens and required animation rules', () => {
        expect(podiumBottomSheetCss).toContain('var(--color-scrim)');
        expect(podiumBottomSheetCss).toContain('var(--color-surface-container-high)');
        expect(podiumBottomSheetCss).toContain('var(--color-surface-container-lowest)');
        expect(podiumBottomSheetCss).toContain('var(--color-outline)');
        expect(podiumBottomSheetCss).toContain('var(--color-outline-variant)');
        expect(podiumBottomSheetCss).toContain('transition: transform 300ms ease-out;');
        expect(podiumBottomSheetCss).toContain('will-change: transform;');
        expect(podiumBottomSheetCss).toContain('touch-action: none;');
        expect(podiumBottomSheetCss).toContain('touch-action: pan-y;');
        expect(podiumBottomSheetCss).toContain('env(safe-area-inset-bottom, 0px)');
    });

    it('applies tablet and desktop podium sheet width and scrim breakpoint rules for the expanded podium composer', () => {
        // Traceability source for AC-25, AC-26, AC-29, and AC-30: GitHub issue #179.
        expect(podiumBottomSheetCss).toMatch(
            /@media\s*\(min-width:\s*768px\)\s*\{[\s\S]*?\.podium-bottom-sheet\s*\{[\s\S]*?max-width:\s*600px;[\s\S]*?\}[\s\S]*?\}/
        );
        expect(podiumBottomSheetCss).toMatch(
            /@media\s*\(min-width:\s*1024px\)\s*\{[\s\S]*?\.podium-bottom-sheet\s*\{[\s\S]*?max-width:\s*720px;[\s\S]*?\}[\s\S]*?\}/
        );
        expect(podiumBottomSheetCss).toMatch(
            /@media\s*\(min-width:\s*768px\)\s*and\s*\(max-width:\s*1023px\)\s*\{[\s\S]*?\[data-theme="dark"\]\s+\.podium-sheet-scrim\s*\{[\s\S]*?background:\s*rgba\(0,\s*0,\s*0,\s*0\.48\);[\s\S]*?background:\s*rgb\(from\s+var\(--color-scrim\)\s+r\s+g\s+b\s*\/\s*0\.48\);[\s\S]*?\}[\s\S]*?\}/
        );
        expect(podiumBottomSheetCss).toMatch(
            /@media\s*\(prefers-color-scheme:\s*dark\)\s*and\s*\(min-width:\s*768px\)\s*and\s*\(max-width:\s*1023px\)\s*\{[\s\S]*?:root:not\(\[data-theme\]\)\s+\.podium-sheet-scrim\s*\{[\s\S]*?background:\s*rgba\(0,\s*0,\s*0,\s*0\.48\);[\s\S]*?background:\s*rgb\(from\s+var\(--color-scrim\)\s+r\s+g\s+b\s*\/\s*0\.48\);[\s\S]*?\}[\s\S]*?\}/
        );
        expect(podiumBottomSheetCss).toMatch(
            /\/\*\s*──\s*Scrim opacity:\s*desktop\s*\(light and dark theme\)\s*──\s*\*\/[\s\S]*?@media\s*\(min-width:\s*1024px\)\s*\{[\s\S]*?\.podium-sheet-scrim\s*\{[\s\S]*?background:\s*rgba\(0,\s*0,\s*0,\s*0\.36\);[\s\S]*?background:\s*rgb\(from\s+var\(--color-scrim\)\s+r\s+g\s+b\s*\/\s*0\.36\);[\s\S]*?\}[\s\S]*?\[data-theme="dark"\]\s+\.podium-sheet-scrim\s*\{[\s\S]*?background:\s*rgba\(0,\s*0,\s*0,\s*0\.52\);[\s\S]*?background:\s*rgb\(from\s+var\(--color-scrim\)\s+r\s+g\s+b\s*\/\s*0\.52\);[\s\S]*?\}[\s\S]*?\}/
        );
        expect(podiumBottomSheetCss).toMatch(
            /@media\s*\(prefers-color-scheme:\s*dark\)\s*and\s*\(min-width:\s*1024px\)\s*\{[\s\S]*?:root:not\(\[data-theme\]\)\s+\.podium-sheet-scrim\s*\{[\s\S]*?background:\s*rgba\(0,\s*0,\s*0,\s*0\.52\);[\s\S]*?background:\s*rgb\(from\s+var\(--color-scrim\)\s+r\s+g\s+b\s*\/\s*0\.52\);[\s\S]*?\}[\s\S]*?\}/
        );
    });
});
