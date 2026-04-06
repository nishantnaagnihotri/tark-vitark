import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Divider } from '../../src/design-system';

describe('Divider', () => {
    describe('vertical orientation', () => {
        it('renders with vertical orientation class by default', () => {
            const { container } = render(<Divider />);
            const el = container.firstElementChild!;
            expect(el).toHaveClass('divider', 'divider--vertical');
            expect(el).toHaveAttribute('role', 'separator');
            expect(el).toHaveAttribute('aria-orientation', 'vertical');
        });

        it('renders with explicit vertical orientation', () => {
            const { container } = render(<Divider orientation="vertical" />);
            const el = container.firstElementChild!;
            expect(el).toHaveClass('divider', 'divider--vertical');
        });
    });

    describe('className passthrough', () => {
        it('appends custom className', () => {
            const { container } = render(<Divider className="spine" />);
            const el = container.firstElementChild!;
            expect(el).toHaveClass('divider', 'divider--vertical', 'spine');
        });
    });
});
