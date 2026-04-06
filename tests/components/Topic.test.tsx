import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Topic } from '../../src/components/Topic';

describe('Topic', () => {
    it('renders h1 element containing topic text', () => {
        render(<Topic text="Should AI be regulated?" />);
        const heading = screen.getByRole('heading', { level: 1 });
        expect(heading).toHaveTextContent('Should AI be regulated?');
    });

    it('uses Typography headline-large role', () => {
        render(<Topic text="Test topic" />);
        const heading = screen.getByRole('heading', { level: 1 });
        expect(heading).toHaveClass('typography', 'typography--headline-large');
    });

    it('includes topic CSS class', () => {
        render(<Topic text="Test topic" />);
        const heading = screen.getByRole('heading', { level: 1 });
        expect(heading).toHaveClass('topic');
    });
});
