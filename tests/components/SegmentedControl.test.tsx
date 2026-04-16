import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SegmentedControl } from '../../src/components/SegmentedControl';
import type { Side } from '../../src/data/debate';

const segmentedControlCss = readFileSync(
    resolve(process.cwd(), 'src/styles/components/segmented-control.css'),
    'utf-8'
);

const sideOptions: readonly Side[] = ['tark', 'vitark'];

describe('SegmentedControl', () => {
    it('renders exactly one radio option for each provided side option', () => {
        render(
            <SegmentedControl
                options={sideOptions}
                value="tark"
                onChange={() => {}}
            />
        );

        expect(screen.getAllByRole('radio')).toHaveLength(sideOptions.length);
    });

    it('marks the selected side with aria-checked="true"', () => {
        render(
            <SegmentedControl
                options={sideOptions}
                value="vitark"
                onChange={() => {}}
            />
        );

        expect(screen.getByRole('radio', { name: 'Vitark' })).toHaveAttribute(
            'aria-checked',
            'true'
        );
        expect(screen.getByRole('radio', { name: 'Tark' })).toHaveAttribute(
            'aria-checked',
            'false'
        );
    });

    it('falls back to the first side when value is not in options for selection and focus anchor', () => {
        render(
            <SegmentedControl
                options={sideOptions}
                value={'unknown' as Side}
                onChange={() => {}}
            />
        );

        expect(screen.getByRole('radio', { name: 'Tark' })).toHaveAttribute(
            'aria-checked',
            'true'
        );
        expect(screen.getByRole('radio', { name: 'Vitark' })).toHaveAttribute(
            'aria-checked',
            'false'
        );
        expect(screen.getByRole('radio', { name: 'Tark' })).toHaveAttribute(
            'tabindex',
            '0'
        );
        expect(screen.getByRole('radio', { name: 'Vitark' })).toHaveAttribute(
            'tabindex',
            '-1'
        );
    });

    it('fires onChange with the clicked side when clicking a non-selected side', () => {
        const onChange: (nextSide: Side) => void = vi.fn();

        render(
            <SegmentedControl
                options={sideOptions}
                value="tark"
                onChange={onChange}
            />
        );

        fireEvent.click(screen.getByRole('radio', { name: 'Vitark' }));

        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange).toHaveBeenCalledWith('vitark');
    });

    it('throws when options include duplicate side values to preserve valid radiogroup semantics', () => {
        expect(() =>
            render(
                <SegmentedControl
                    options={['tark', 'tark']}
                    value="tark"
                    onChange={() => {}}
                />
            )
        ).toThrowError(/SegmentedControl options must be unique/);
    });

    it('throws when options are empty to preserve valid radiogroup semantics', () => {
        expect(() =>
            render(
                <SegmentedControl
                    options={[]}
                    value="tark"
                    onChange={() => {}}
                />
            )
        ).toThrowError(/SegmentedControl options must include at least one value/);
    });

    it('supports arrow-key navigation and calls onChange with the next side', () => {
        const onChange = vi.fn();

        render(
            <SegmentedControl
                options={sideOptions}
                value="tark"
                onChange={onChange}
            />
        );

        const tarkRadio = screen.getByRole('radio', { name: 'Tark' });
        const vitarkRadio = screen.getByRole('radio', { name: 'Vitark' });
        tarkRadio.focus();

        fireEvent.keyDown(tarkRadio, { key: 'ArrowRight' });

        expect(onChange).toHaveBeenCalledWith('vitark');
        expect(vitarkRadio).toHaveFocus();
    });

    it('does not fire onChange during arrow navigation when wrapped selection stays unchanged', () => {
        const onChange = vi.fn();

        render(
            <SegmentedControl
                options={['tark']}
                value="tark"
                onChange={onChange}
            />
        );

        const tarkRadio = screen.getByRole('radio', { name: 'Tark' });
        tarkRadio.focus();

        fireEvent.keyDown(tarkRadio, { key: 'ArrowRight' });

        expect(onChange).not.toHaveBeenCalled();
        expect(tarkRadio).toHaveFocus();
    });

    it('supports reverse arrow-key navigation and calls onChange with the previous side', () => {
        const onChange = vi.fn();

        render(
            <SegmentedControl
                options={sideOptions}
                value="vitark"
                onChange={onChange}
            />
        );

        const tarkRadio = screen.getByRole('radio', { name: 'Tark' });
        const vitarkRadio = screen.getByRole('radio', { name: 'Vitark' });
        vitarkRadio.focus();

        fireEvent.keyDown(vitarkRadio, { key: 'ArrowLeft' });

        expect(onChange).toHaveBeenCalledWith('tark');
        expect(tarkRadio).toHaveFocus();
    });

    it('does not activate selection on Enter or Space keydown and still activates via click', () => {
        const onChange = vi.fn();

        render(
            <SegmentedControl
                options={sideOptions}
                value="tark"
                onChange={onChange}
            />
        );

        const vitarkRadio = screen.getByRole('radio', { name: 'Vitark' });
        vitarkRadio.focus();

        expect(vitarkRadio).toHaveFocus();

        fireEvent.keyDown(vitarkRadio, { key: 'Enter' });
        fireEvent.keyDown(vitarkRadio, { key: ' ' });
        fireEvent.keyDown(vitarkRadio, { key: 'Spacebar' });

        expect(onChange).not.toHaveBeenCalled();

        fireEvent.click(vitarkRadio);

        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange).toHaveBeenCalledWith('vitark');
    });

    it('uses radiogroup and radio ARIA roles', () => {
        render(
            <>
                <h2 id="side-selection-label">Side selection</h2>
                <SegmentedControl
                    options={sideOptions}
                    value="tark"
                    onChange={() => {}}
                    aria-labelledby="side-selection-label"
                />
            </>
        );

        expect(
            screen.getByRole('radiogroup', {
                name: 'Side selection',
            })
        ).toBeInTheDocument();
        expect(screen.getAllByRole('radio')).toHaveLength(sideOptions.length);
    });

    it('falls back to a default radiogroup accessible name when no label props are provided', () => {
        render(
            <SegmentedControl
                options={sideOptions}
                value="tark"
                onChange={() => {}}
            />
        );

        expect(
            screen.getByRole('radiogroup', {
                name: 'Side selection',
            })
        ).toBeInTheDocument();
    });

    it('binds selected and unselected visual colors to brand tokens', () => {
        expect(segmentedControlCss).toContain('var(--color-brand-primary)');
        expect(segmentedControlCss).toContain('var(--color-brand-on-primary)');
    });

    it('uses defined spacing tokens and state-aware focus color in segmented-control CSS', () => {
        expect(segmentedControlCss).not.toContain('var(--space-2)');
        expect(segmentedControlCss).toContain('padding: var(--space-4) var(--space-4);');
        expect(segmentedControlCss).toContain('outline: 2px solid currentColor;');
    });
});
