import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Typography } from '../../src/design-system';

describe('Typography', () => {
    describe('role rendering', () => {
        it('renders headline-large with h1 element by default', () => {
            render(<Typography role="headline-large">Heading</Typography>);
            const el = screen.getByText('Heading');
            expect(el.tagName).toBe('H1');
            expect(el).toHaveClass('typography', 'typography--headline-large');
        });

        it('renders body-large with p element by default', () => {
            render(<Typography role="body-large">Body text</Typography>);
            const el = screen.getByText('Body text');
            expect(el.tagName).toBe('P');
            expect(el).toHaveClass('typography', 'typography--body-large');
        });

        it('renders label-medium with span element by default', () => {
            render(<Typography role="label-medium">Label</Typography>);
            const el = screen.getByText('Label');
            expect(el.tagName).toBe('SPAN');
            expect(el).toHaveClass('typography', 'typography--label-medium');
        });
    });

    describe('as prop override', () => {
        it('overrides default element when as prop is provided', () => {
            render(
                <Typography role="headline-large" as="h2">
                    Subheading
                </Typography>
            );
            const el = screen.getByText('Subheading');
            expect(el.tagName).toBe('H2');
            expect(el).toHaveClass('typography', 'typography--headline-large');
        });
    });

    describe('className passthrough', () => {
        it('appends custom className', () => {
            render(
                <Typography role="body-large" className="custom-class">
                    Text
                </Typography>
            );
            const el = screen.getByText('Text');
            expect(el).toHaveClass('typography', 'typography--body-large', 'custom-class');
        });
    });

    describe('children rendering', () => {
        it('renders children content', () => {
            render(<Typography role="body-large">Content text</Typography>);
            expect(screen.getByText('Content text')).toBeInTheDocument();
        });
    });
});
