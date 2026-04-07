import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Timeline } from '../../src/components/Timeline';
import type { Argument } from '../../src/data/debate';

const mockArguments: Argument[] = [
    { id: 1, side: 'tark', text: 'Tark argument one' },
    { id: 2, side: 'vitark', text: 'Vitark argument two' },
    { id: 3, side: 'tark', text: 'Tark argument three' },
];

describe('Timeline', () => {
    it('renders an <ol> as the argument list', () => {
        render(<Timeline arguments={mockArguments} />);
        const list = screen.getByRole('list');
        expect(list.tagName).toBe('OL');
    });

    it('renders the correct number of argument cards', () => {
        render(<Timeline arguments={mockArguments} />);
        const items = screen.getAllByRole('listitem');
        expect(items).toHaveLength(mockArguments.length);
    });

    it('preserves posting order (DOM order matches data order)', () => {
        render(<Timeline arguments={mockArguments} />);
        const items = screen.getAllByRole('listitem');
        expect(items[0]).toHaveTextContent('Tark argument one');
        expect(items[1]).toHaveTextContent('Vitark argument two');
        expect(items[2]).toHaveTextContent('Tark argument three');
    });

    it('wraps in a <section> with aria-label "Debate arguments"', () => {
        render(<Timeline arguments={mockArguments} />);
        const section = screen.getByRole('region', {
            name: 'Debate arguments',
        });
        expect(section).toBeInTheDocument();
    });

    it('includes a center spine Divider (desktop/tablet)', () => {
        const { container } = render(<Timeline arguments={mockArguments} />);
        const spine = container.querySelector('.timeline__spine');
        expect(spine).toBeInTheDocument();
        const divider = spine!.querySelector('.divider--vertical');
        expect(divider).toBeInTheDocument();
    });

    it('applies timeline CSS class', () => {
        render(<Timeline arguments={mockArguments} />);
        const section = screen.getByRole('region', {
            name: 'Debate arguments',
        });
        expect(section).toHaveClass('timeline');
    });

    it('applies side-specific class to each list item', () => {
        render(<Timeline arguments={mockArguments} />);
        const items = screen.getAllByRole('listitem');
        expect(items[0]).toHaveClass('timeline__item--tark');
        expect(items[1]).toHaveClass('timeline__item--vitark');
        expect(items[2]).toHaveClass('timeline__item--tark');
    });

    it('renders spine dot markers for each argument', () => {
        const { container } = render(<Timeline arguments={mockArguments} />);
        const dots = container.querySelectorAll('.timeline__dot');
        expect(dots).toHaveLength(mockArguments.length);
    });
});
