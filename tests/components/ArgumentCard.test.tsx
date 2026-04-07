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
        render(<ArgumentCard argument={tarkArgument} />);
        expect(screen.getByLabelText('Tark argument')).toBeInTheDocument();
    });

    it('applies aria-label "Vitark argument" for vitark side', () => {
        render(<ArgumentCard argument={vitarkArgument} />);
        expect(screen.getByLabelText('Vitark argument')).toBeInTheDocument();
    });

    it('applies argument-card--tark CSS class for tark side', () => {
        render(<ArgumentCard argument={tarkArgument} />);
        const card = screen.getByLabelText('Tark argument');
        expect(card).toHaveClass('argument-card', 'argument-card--tark');
    });

    it('applies argument-card--vitark CSS class for vitark side', () => {
        render(<ArgumentCard argument={vitarkArgument} />);
        const card = screen.getByLabelText('Vitark argument');
        expect(card).toHaveClass('argument-card', 'argument-card--vitark');
    });

    it('composes Card DS primitive (card class present)', () => {
        render(<ArgumentCard argument={tarkArgument} />);
        const card = screen.getByLabelText('Tark argument');
        expect(card).toHaveClass('card');
    });

    it('composes Typography body-large (typography class present)', () => {
        render(<ArgumentCard argument={tarkArgument} />);
        const text = screen.getByText('Tark argument text');
        expect(text).toHaveClass('typography', 'typography--body-large');
    });
});
