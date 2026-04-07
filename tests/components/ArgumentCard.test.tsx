import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ArgumentCard } from '../../src/components/ArgumentCard';
import type { Argument } from '../../src/data/debate';

const tarkArgument: Argument = {
    id: 1,
    side: 'tark',
    text: 'Tark argument text',
};

const vitarkArgument: Argument = {
    id: 2,
    side: 'vitark',
    text: 'Vitark argument text',
};

describe('ArgumentCard', () => {
    it('renders argument text content', () => {
        render(<ArgumentCard argument={tarkArgument} />);
        expect(screen.getByText('Tark argument text')).toBeInTheDocument();
    });

    it('applies aria-label "Tark argument" for tark side', () => {
        const { container } = render(<ArgumentCard argument={tarkArgument} />);
        const card = container.firstElementChild as HTMLElement;
        expect(card).toHaveAttribute('aria-label', 'Tark argument');
    });

    it('applies aria-label "Vitark argument" for vitark side', () => {
        const { container } = render(<ArgumentCard argument={vitarkArgument} />);
        const card = container.firstElementChild as HTMLElement;
        expect(card).toHaveAttribute('aria-label', 'Vitark argument');
    });

    it('applies argument-card--tark CSS class for tark side', () => {
        const { container } = render(<ArgumentCard argument={tarkArgument} />);
        const card = container.firstElementChild as HTMLElement;
        expect(card).toHaveClass('argument-card', 'argument-card--tark');
    });

    it('applies argument-card--vitark CSS class for vitark side', () => {
        const { container } = render(<ArgumentCard argument={vitarkArgument} />);
        const card = container.firstElementChild as HTMLElement;
        expect(card).toHaveClass('argument-card', 'argument-card--vitark');
    });

    it('composes Card DS primitive (card class present)', () => {
        const { container } = render(<ArgumentCard argument={tarkArgument} />);
        const card = container.firstElementChild as HTMLElement;
        expect(card).toHaveClass('card');
    });

    it('composes Typography body-large (typography class present)', () => {
        render(<ArgumentCard argument={tarkArgument} />);
        const text = screen.getByText('Tark argument text');
        expect(text).toHaveClass('typography', 'typography--body-large');
    });
});
