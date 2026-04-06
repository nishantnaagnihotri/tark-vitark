import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Card } from '../../src/design-system';

describe('Card', () => {
  describe('side variants', () => {
    it('renders tark variant with correct CSS class', () => {
      render(<Card side="tark">Tark content</Card>);
      const el = screen.getByText('Tark content');
      expect(el).toHaveClass('card', 'card--tark');
    });

    it('renders vitark variant with correct CSS class', () => {
      render(<Card side="vitark">Vitark content</Card>);
      const el = screen.getByText('Vitark content');
      expect(el).toHaveClass('card', 'card--vitark');
    });
  });

  describe('className passthrough', () => {
    it('appends custom className', () => {
      render(
        <Card side="tark" className="extra">
          Content
        </Card>
      );
      const el = screen.getByText('Content');
      expect(el).toHaveClass('card', 'card--tark', 'extra');
    });
  });

  describe('children rendering', () => {
    it('renders children content', () => {
      render(<Card side="vitark">Card body</Card>);
      expect(screen.getByText('Card body')).toBeInTheDocument();
    });
  });
});
