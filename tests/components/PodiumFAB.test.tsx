import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PodiumFAB } from '../../src/components/PodiumFAB';

const podiumFabCss = readFileSync(
    resolve(process.cwd(), 'src/styles/components/podium-fab.css'),
    'utf-8'
);

describe('PodiumFAB', () => {
    it('renders collapsed state with + button aria contract', () => {
        const { container } = render(
            <PodiumFAB
                isExpanded={false}
                onExpand={() => {}}
                onSideSelect={() => {}}
                onCollapse={() => {}}
            />
        );

        const openButton = screen.getByRole('button', { name: 'Open post composer' });
        expect(openButton).toHaveTextContent('+');
        expect(openButton).toHaveAttribute('aria-expanded', 'false');
        expect(openButton).toHaveClass('podium-fab');
        expect(screen.queryByRole('group', { name: 'Post composer options' })).not.toBeInTheDocument();
        expect(container.querySelector('.podium-fab--expanded')).toBeInTheDocument();
    });

    it('calls onExpand when + is clicked', () => {
        const onExpand = vi.fn();

        render(
            <PodiumFAB
                isExpanded={false}
                onExpand={onExpand}
                onSideSelect={() => {}}
                onCollapse={() => {}}
            />
        );

        fireEvent.click(screen.getByRole('button', { name: 'Open post composer' }));
        expect(onExpand).toHaveBeenCalledTimes(1);
    });

    it('renders expanded state buttons with aria labels and expanded class', () => {
        render(
            <PodiumFAB
                isExpanded
                onExpand={() => {}}
                onSideSelect={() => {}}
                onCollapse={() => {}}
            />
        );

        const group = screen.getByRole('group', { name: 'Post composer options' });
        expect(group).toHaveClass('podium-fab');
        expect(group).toHaveClass('podium-fab--expanded');
        expect(screen.getByRole('button', { name: 'Post as Tark' })).toHaveTextContent('T');
        expect(screen.getByRole('button', { name: 'Post as Vitark' })).toHaveTextContent('V');
        expect(screen.getByRole('button', { name: 'Close' })).toHaveTextContent('×');
    });

    it('wires expanded actions for side selection and collapse', () => {
        const onSideSelect = vi.fn();
        const onCollapse = vi.fn();

        render(
            <PodiumFAB
                isExpanded
                onExpand={() => {}}
                onSideSelect={onSideSelect}
                onCollapse={onCollapse}
            />
        );

        fireEvent.click(screen.getByRole('button', { name: 'Post as Tark' }));
        fireEvent.click(screen.getByRole('button', { name: 'Post as Vitark' }));
        fireEvent.click(screen.getByRole('button', { name: 'Close' }));

        expect(onSideSelect).toHaveBeenNthCalledWith(1, 'tark');
        expect(onSideSelect).toHaveBeenNthCalledWith(2, 'vitark');
        expect(onCollapse).toHaveBeenCalledTimes(1);
    });

    it('moves focus into composer controls on expand and restores it on collapse', () => {
        const { rerender } = render(
            <PodiumFAB
                isExpanded={false}
                onExpand={() => {}}
                onSideSelect={() => {}}
                onCollapse={() => {}}
            />
        );

        const openButton = screen.getByRole('button', { name: 'Open post composer' });
        openButton.focus();

        rerender(
            <PodiumFAB
                isExpanded
                onExpand={() => {}}
                onSideSelect={() => {}}
                onCollapse={() => {}}
            />
        );

        expect(screen.getByRole('button', { name: 'Post as Tark' })).toHaveFocus();

        rerender(
            <PodiumFAB
                isExpanded={false}
                onExpand={() => {}}
                onSideSelect={() => {}}
                onCollapse={() => {}}
            />
        );

        expect(screen.getByRole('button', { name: 'Open post composer' })).toHaveFocus();
    });

    it('defines tokenized colors and 300ms scale/opacity transitions in CSS source', () => {
        expect(podiumFabCss).toContain('background-color: var(--color-brand-primary);');
        expect(podiumFabCss).toContain('background-color: var(--color-tark-surface);');
        expect(podiumFabCss).toContain('background-color: var(--color-vitark-surface);');
        expect(podiumFabCss).toContain('var(--color-elevation-shadow-ambient)');
        expect(podiumFabCss).toContain('var(--color-elevation-shadow-key)');
        expect(podiumFabCss).toContain('transition: opacity 300ms ease-out, transform 300ms ease-out;');
        expect(podiumFabCss).toContain('transform: scale(0.8);');
        expect(podiumFabCss).not.toMatch(/#[0-9a-fA-F]{3,8}/);
        expect(podiumFabCss).not.toMatch(/\brgba?\s*\(/i);
        expect(podiumFabCss).not.toMatch(/\bhsla?\s*\(/i);
    });
});
