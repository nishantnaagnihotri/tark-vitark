import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
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

class ResizeObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
}

function mockBodyHeights(clientHeight: number, scrollHeight: number) {
    vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(clientHeight);
    vi.spyOn(HTMLElement.prototype, 'scrollHeight', 'get').mockReturnValue(scrollHeight);
}

beforeEach(() => {
    vi.stubGlobal('ResizeObserver', ResizeObserverStub);
});

afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
});

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

    it('does not render read more button when text is not clamped', () => {
        mockBodyHeights(64, 64);

        render(<ArgumentCard argument={tarkArgument} />);

        expect(screen.queryByRole('button', { name: /read more/i })).not.toBeInTheDocument();
    });

    it('renders read more when clamped and toggles expanded state with aria-expanded', () => {
        mockBodyHeights(64, 128);

        render(<ArgumentCard argument={tarkArgument} />);

        const bodyText = screen.getByText('Tark argument text');
        const bodyContainer = bodyText.closest('.argument-card__body');
        const toggleButton = screen.getByRole('button', { name: /read more/i });

        expect(bodyContainer).not.toBeNull();
        if (!bodyContainer) {
            throw new Error('Argument body container should be present.');
        }

        expect(bodyContainer).toHaveClass('argument-card__body--clamped');
        expect(toggleButton).toHaveAttribute('aria-expanded', 'false');

        fireEvent.click(toggleButton);

        const showLessButton = screen.getByRole('button', { name: /show less/i });
        expect(bodyContainer).not.toHaveClass('argument-card__body--clamped');
        expect(showLessButton).toHaveAttribute('aria-expanded', 'true');

        fireEvent.click(showLessButton);

        const readMoreButton = screen.getByRole('button', { name: /read more/i });
        expect(bodyContainer).toHaveClass('argument-card__body--clamped');
        expect(readMoreButton).toHaveAttribute('aria-expanded', 'false');
    });

    it('uses descriptive accessible names for expand/collapse controls across cards', () => {
        mockBodyHeights(64, 128);

        render(
            <>
                <ArgumentCard argument={tarkArgument} />
                <ArgumentCard argument={vitarkArgument} />
            </>
        );

        const tarkReadMoreButton = screen.getByRole('button', { name: 'Read more for Tark argument 1' });
        const vitarkReadMoreButton = screen.getByRole('button', { name: 'Read more for Vitark argument 2' });

        expect(tarkReadMoreButton).toHaveTextContent('Read more');
        expect(vitarkReadMoreButton).toHaveTextContent('Read more');

        fireEvent.click(tarkReadMoreButton);

        const tarkShowLessButton = screen.getByRole('button', { name: 'Show less for Tark argument 1' });
        expect(tarkShowLessButton).toHaveTextContent('Show less');
    });

    it('attaches ResizeObserver only while collapsed', () => {
        mockBodyHeights(64, 128);

        const observe = vi.fn();
        const disconnect = vi.fn();

        class TrackingResizeObserver {
            observe = observe;
            unobserve() {}
            disconnect = disconnect;
        }

        vi.stubGlobal('ResizeObserver', TrackingResizeObserver);

        render(<ArgumentCard argument={tarkArgument} />);

        expect(observe).toHaveBeenCalledTimes(1);

        fireEvent.click(screen.getByRole('button', { name: /read more/i }));

        expect(disconnect).toHaveBeenCalledTimes(1);
        expect(observe).toHaveBeenCalledTimes(1);

        fireEvent.click(screen.getByRole('button', { name: /show less/i }));

        expect(observe).toHaveBeenCalledTimes(2);
    });

    it('never renders edit or delete controls', () => {
        mockBodyHeights(64, 128);

        render(<ArgumentCard argument={tarkArgument} />);

        expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: /read more/i }));

        expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument();
    });
});
