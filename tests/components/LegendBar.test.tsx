import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { LegendBar } from '../../src/components/LegendBar';

describe('LegendBar', () => {
    it('renders nav with accessible name "Debate sides legend"', () => {
        render(<LegendBar />);
        const nav = screen.getByRole('navigation', { name: 'Debate sides legend' });
        expect(nav).toBeInTheDocument();
    });

    it('contains "Tark" text', () => {
        render(<LegendBar />);
        expect(screen.getByText(/Tark · for/)).toBeInTheDocument();
    });

    it('contains "Vitark" text', () => {
        render(<LegendBar />);
        expect(screen.getByText(/Vitark · against/)).toBeInTheDocument();
    });

    it('has legend-bar CSS class on nav', () => {
        render(<LegendBar />);
        const nav = screen.getByRole('navigation', { name: 'Debate sides legend' });
        expect(nav).toHaveClass('legend-bar');
    });

    it('renders tark colored dot', () => {
        render(<LegendBar />);
        const nav = screen.getByRole('navigation', { name: 'Debate sides legend' });
        expect(nav.querySelector('.legend-bar__dot--tark')).toBeInTheDocument();
    });

    it('renders vitark colored dot', () => {
        render(<LegendBar />);
        const nav = screen.getByRole('navigation', { name: 'Debate sides legend' });
        expect(nav.querySelector('.legend-bar__dot--vitark')).toBeInTheDocument();
    });

    it('renders separator between sides', () => {
        render(<LegendBar />);
        expect(screen.getByText('•')).toBeInTheDocument();
    });
});
