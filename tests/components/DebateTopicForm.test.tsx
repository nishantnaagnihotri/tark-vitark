import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { DebateTopicForm } from '../../src/components/DebateTopicForm';

const debateTopicFormCss = readFileSync(
    resolve(process.cwd(), 'src/styles/components/debate-topic-form.css'),
    'utf-8'
);
const tokensCss = readFileSync(resolve(process.cwd(), 'src/styles/tokens.css'), 'utf-8');

describe('DebateTopicForm', () => {
    it('shows the create flow with Start disabled at 0 / 120 (AC-29)', () => {
        render(<DebateTopicForm mode="create" onStartDebate={vi.fn()} />);

        const topicInput = screen.getByRole('textbox', { name: 'Debate topic' });
        expect(topicInput).toHaveValue('');
        expect(topicInput).toHaveAttribute('name', 'debate-topic');
        expect(screen.getByText('0 / 120')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Start' })).toBeDisabled();
        expect(screen.queryByRole('button', { name: 'Cancel' })).not.toBeInTheDocument();
    });

    it('keeps Start disabled with no error when topic is 1-9 canonical characters (AC-30)', async () => {
        const user = userEvent.setup();
        render(<DebateTopicForm mode="create" onStartDebate={vi.fn()} />);

        await user.type(screen.getByRole('textbox', { name: 'Debate topic' }), 'abcdefghi');

        expect(screen.getByRole('button', { name: 'Start' })).toBeDisabled();
        expect(screen.getByText('9 / 120')).toBeInTheDocument();
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('enables Start when canonical topic length is 10-120 (AC-30, AC-31)', async () => {
        const user = userEvent.setup();
        render(<DebateTopicForm mode="create" onStartDebate={vi.fn()} />);

        await user.type(screen.getByRole('textbox', { name: 'Debate topic' }), '          abcdefghij          ');

        expect(screen.getByRole('button', { name: 'Start' })).toBeEnabled();
        expect(screen.getByText('10 / 120')).toBeInTheDocument();
    });

    it('shows too-long counter + inline error and disables Start above 120 canonical characters (AC-30)', async () => {
        const user = userEvent.setup();
        render(<DebateTopicForm mode="create" onStartDebate={vi.fn()} />);

        await user.type(screen.getByRole('textbox', { name: 'Debate topic' }), 'a'.repeat(121));

        expect(screen.getByRole('button', { name: 'Start' })).toBeDisabled();
        expect(screen.getByRole('alert')).toHaveTextContent('Topic must be 120 characters or fewer.');

        const counter = screen.getByText('121 / 120');
        expect(counter).toHaveClass('debate-topic-form__counter--error');
    });

    it('submits only the canonical trimmed topic value (AC-29, AC-30, AC-31)', async () => {
        const user = userEvent.setup();
        const onStartDebate = vi.fn();
        render(<DebateTopicForm mode="create" onStartDebate={onStartDebate} />);

        await user.type(
            screen.getByRole('textbox', { name: 'Debate topic' }),
            '          Is remote work better than office work?          '
        );
        await user.click(screen.getByRole('button', { name: 'Start' }));

        await waitFor(() => {
            expect(onStartDebate).toHaveBeenCalledTimes(1);
            expect(onStartDebate).toHaveBeenCalledWith('Is remote work better than office work?');
        });
    });

    it('shows inline warning + Cancel in replace flow and does not render a blocking dialog (AC-35, AC-40)', () => {
        const onCancelReplace = vi.fn();
        render(
            <DebateTopicForm
                mode="replace"
                onStartDebate={vi.fn()}
                onCancelReplace={onCancelReplace}
            />
        );

        expect(screen.getByText(/You already have an active debate\./)).toBeInTheDocument();
        expect(screen.getByText('Starting a new one will replace it.')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
        expect(onCancelReplace).toHaveBeenCalledTimes(1);
    });

    it('disables Cancel while replacement debate start is in-flight (AC-35, AC-40)', async () => {
        const user = userEvent.setup();
        let resolveStartDebate: (() => void) | undefined;
        const onStartDebate = vi.fn(
            () =>
                new Promise<void>((resolve) => {
                    resolveStartDebate = resolve;
                })
        );
        const onCancelReplace = vi.fn();

        render(
            <DebateTopicForm
                mode="replace"
                onStartDebate={onStartDebate}
                onCancelReplace={onCancelReplace}
            />
        );

        await user.type(screen.getByRole('textbox', { name: 'Debate topic' }), 'abcdefghij');

        const startDebateButton = screen.getByRole('button', { name: 'Start' });
        const cancelReplaceButton = screen.getByRole('button', { name: 'Cancel' });
        await user.click(startDebateButton);

        await waitFor(() => {
            expect(cancelReplaceButton).toBeDisabled();
        });

        fireEvent.click(cancelReplaceButton);
        expect(onCancelReplace).not.toHaveBeenCalled();

        resolveStartDebate?.();

        await waitFor(() => {
            expect(cancelReplaceButton).toBeEnabled();
        });
    });

    it('keeps the TV lettermark treatment aligned with approved brand styling (issue-220 contract)', () => {
        const lettermarkTypographyBlock = debateTopicFormCss.match(
            /\.debate-topic-form__lettermark-text\s*\{[^}]+\}/
        )?.[0];

        expect(lettermarkTypographyBlock).toBeDefined();
        expect(lettermarkTypographyBlock).toContain(
            'font-size: var(--typescale-brand-tv-lettermark-size);'
        );
        expect(lettermarkTypographyBlock).toContain(
            'font-weight: var(--typescale-brand-tv-lettermark-weight);'
        );
        expect(lettermarkTypographyBlock).toContain(
            'line-height: var(--typescale-brand-tv-lettermark-line-height);'
        );
        expect(lettermarkTypographyBlock).toContain(
            'letter-spacing: var(--typescale-brand-tv-lettermark-tracking);'
        );
        expect(lettermarkTypographyBlock).not.toContain('font-size: 20px;');
        expect(lettermarkTypographyBlock).not.toContain('font-weight: 900;');
        expect(lettermarkTypographyBlock).not.toContain('letter-spacing: -1.5px;');

        expect(tokensCss).toContain('--typescale-brand-tv-lettermark-size: 1.25rem;');
        expect(tokensCss).toContain('--typescale-brand-tv-lettermark-weight: 900;');
        expect(tokensCss).toContain('--typescale-brand-tv-lettermark-line-height: normal;');
        expect(tokensCss).toContain('--typescale-brand-tv-lettermark-tracking: -0.09375rem;');
    });

    it('keeps create-debate topic copy aligned with approved typography (issue-221 contract)', () => {
        const topicInputBlock = debateTopicFormCss.match(
            /\.debate-topic-form__topic-input\s*\{[^}]+\}/
        )?.[0];
        const topicCounterBlock = debateTopicFormCss.match(
            /\.debate-topic-form__counter\s*\{[^}]+\}/
        )?.[0];
        const replaceWarningBlock = debateTopicFormCss.match(
            /\.debate-topic-form__replace-warning\s*\{[^}]+\}/
        )?.[0];
        const topicErrorBlock = debateTopicFormCss.match(
            /\.debate-topic-form__error\s*\{[^}]+\}/
        )?.[0];
        const startActionBlock = debateTopicFormCss.match(
            /\.debate-topic-form__start\s*\{[^}]+\}/
        )?.[0];
        const cancelActionBlock = debateTopicFormCss.match(
            /\.debate-topic-form__cancel\s*\{[^}]+\}/
        )?.[0];

        expect(topicInputBlock).toBeDefined();
        expect(topicCounterBlock).toBeDefined();
        expect(replaceWarningBlock).toBeDefined();
        expect(topicErrorBlock).toBeDefined();
        expect(startActionBlock).toBeDefined();
        expect(cancelActionBlock).toBeDefined();

        expect(topicInputBlock).toContain(
            'font-size: var(--typescale-create-debate-topic-input-size);'
        );
        expect(topicInputBlock).toContain(
            'font-weight: var(--typescale-create-debate-topic-input-weight);'
        );
        expect(topicInputBlock).toContain(
            'line-height: var(--typescale-create-debate-topic-input-line-height);'
        );
        expect(topicInputBlock).toContain(
            'letter-spacing: var(--typescale-create-debate-topic-input-tracking);'
        );

        expect(topicCounterBlock).toContain(
            'font-family: var(--font-family-plain);'
        );
        expect(topicCounterBlock).toContain(
            'font-size: var(--typescale-create-debate-topic-counter-size);'
        );
        expect(topicCounterBlock).toContain(
            'font-weight: var(--typescale-create-debate-topic-counter-weight);'
        );
        expect(topicCounterBlock).toContain(
            'line-height: var(--typescale-create-debate-topic-counter-line-height);'
        );
        expect(topicCounterBlock).toContain(
            'letter-spacing: var(--typescale-create-debate-topic-counter-tracking);'
        );

        expect(replaceWarningBlock).toContain(
            'font-size: var(--typescale-create-debate-topic-warning-size);'
        );
        expect(replaceWarningBlock).toContain(
            'font-weight: var(--typescale-create-debate-topic-warning-weight);'
        );
        expect(replaceWarningBlock).toContain(
            'line-height: var(--typescale-create-debate-topic-warning-line-height);'
        );
        expect(replaceWarningBlock).toContain(
            'letter-spacing: var(--typescale-create-debate-topic-warning-tracking);'
        );

        expect(topicErrorBlock).toContain(
            'font-size: var(--typescale-create-debate-topic-error-size);'
        );
        expect(topicErrorBlock).toContain(
            'font-weight: var(--typescale-create-debate-topic-error-weight);'
        );
        expect(topicErrorBlock).toContain(
            'line-height: var(--typescale-create-debate-topic-error-line-height);'
        );
        expect(topicErrorBlock).toContain(
            'letter-spacing: var(--typescale-create-debate-topic-error-tracking);'
        );

        expect(startActionBlock).toContain(
            'font-size: var(--typescale-create-debate-start-action-size);'
        );
        expect(startActionBlock).toContain(
            'font-weight: var(--typescale-create-debate-start-action-weight);'
        );
        expect(startActionBlock).toContain(
            'line-height: var(--typescale-create-debate-start-action-line-height);'
        );
        expect(startActionBlock).toContain(
            'letter-spacing: var(--typescale-create-debate-start-action-tracking);'
        );

        expect(cancelActionBlock).toContain(
            'font-size: var(--typescale-create-debate-cancel-action-size);'
        );
        expect(cancelActionBlock).toContain(
            'font-weight: var(--typescale-create-debate-cancel-action-weight);'
        );
        expect(cancelActionBlock).toContain(
            'line-height: var(--typescale-create-debate-cancel-action-line-height);'
        );
        expect(cancelActionBlock).toContain(
            'letter-spacing: var(--typescale-create-debate-cancel-action-tracking);'
        );

        expect(debateTopicFormCss).not.toContain('font-size: 16px;');
        expect(debateTopicFormCss).not.toContain('font-size: 14px;');
        expect(debateTopicFormCss).not.toContain('font-size: 12px;');
        expect(debateTopicFormCss).not.toContain('font-size: 11px;');
        expect(debateTopicFormCss).not.toContain('line-height: 16px;');
        expect(debateTopicFormCss).not.toContain('letter-spacing: 0.1px;');

        expect(tokensCss).toContain('--typescale-create-debate-topic-input-size: 1rem;');
        expect(tokensCss).toContain('--typescale-create-debate-topic-input-weight: 400;');
        expect(tokensCss).toContain('--typescale-create-debate-topic-input-line-height: normal;');
        expect(tokensCss).toContain('--typescale-create-debate-topic-input-tracking: 0;');

        expect(tokensCss).toContain('--typescale-create-debate-topic-counter-size: 0.6875rem;');
        expect(tokensCss).toContain('--typescale-create-debate-topic-counter-weight: 500;');
        expect(tokensCss).toContain('--typescale-create-debate-topic-counter-line-height: 1rem;');
        expect(tokensCss).toContain('--typescale-create-debate-topic-counter-tracking: 0;');

        expect(tokensCss).toContain('--typescale-create-debate-topic-warning-size: 0.75rem;');
        expect(tokensCss).toContain('--typescale-create-debate-topic-warning-weight: 400;');
        expect(tokensCss).toContain('--typescale-create-debate-topic-warning-line-height: normal;');
        expect(tokensCss).toContain('--typescale-create-debate-topic-warning-tracking: 0;');

        expect(tokensCss).toContain('--typescale-create-debate-topic-error-size: 0.6875rem;');
        expect(tokensCss).toContain('--typescale-create-debate-topic-error-weight: 400;');
        expect(tokensCss).toContain('--typescale-create-debate-topic-error-line-height: normal;');
        expect(tokensCss).toContain('--typescale-create-debate-topic-error-tracking: 0;');

        expect(tokensCss).toContain('--typescale-create-debate-start-action-size: 0.875rem;');
        expect(tokensCss).toContain('--typescale-create-debate-start-action-weight: 600;');
        expect(tokensCss).toContain('--typescale-create-debate-start-action-line-height: normal;');
        expect(tokensCss).toContain('--typescale-create-debate-start-action-tracking: 0;');

        expect(tokensCss).toContain('--typescale-create-debate-cancel-action-size: 0.875rem;');
        expect(tokensCss).toContain('--typescale-create-debate-cancel-action-weight: 500;');
        expect(tokensCss).toContain('--typescale-create-debate-cancel-action-line-height: normal;');
        expect(tokensCss).toContain('--typescale-create-debate-cancel-action-tracking: 0.00625rem;');
    });

    it('pins topic-form geometry and token usage to Figma values for create and replace states', () => {
        expect(debateTopicFormCss).toContain(
            '.debate-topic-form {\n    width: 100%;\n    max-width: var(--size-create-debate-content-max-width);'
        );
        expect(debateTopicFormCss).toContain('max-width: var(--size-create-debate-content-max-width);');
        expect(debateTopicFormCss).toContain('.debate-topic-form__form {\n    width: 100%;');
        expect(debateTopicFormCss).toContain('@media (min-width: 768px)');
        expect(debateTopicFormCss).toContain(
            'max-width: var(--size-create-debate-content-max-width-tablet);'
        );
        expect(debateTopicFormCss).toContain('@media (min-width: 1024px)');
        expect(debateTopicFormCss).toContain(
            'max-width: var(--size-create-debate-content-max-width-desktop);'
        );
        expect(tokensCss).toContain('--size-create-debate-content-max-width-tablet: 600px;');
        expect(tokensCss).toContain('--size-create-debate-content-max-width-desktop: 640px;');
        expect(debateTopicFormCss).toContain('height: 56px;');
        expect(debateTopicFormCss).toContain('padding: 0 15px;');
        expect(debateTopicFormCss).toContain('height: 40px;');
        expect(debateTopicFormCss).toContain('padding: 0 24px;');
        expect(debateTopicFormCss).toContain('padding: 0 12px;');
        expect(debateTopicFormCss).toContain('border-radius: var(--radius-sharp);');
        expect(debateTopicFormCss).toContain('border-radius: 20px;');
        expect(debateTopicFormCss).toContain('var(--color-outline)');
        expect(debateTopicFormCss).toContain('var(--color-error)');
        expect(debateTopicFormCss).toContain('var(--color-primary)');
        expect(debateTopicFormCss).toContain('color: var(--color-brand-primary);');
        expect(debateTopicFormCss).toContain('var(--color-on-primary)');
        expect(debateTopicFormCss).toContain('var(--color-surface-container-highest)');
        expect(debateTopicFormCss).toContain('var(--color-on-surface-variant)');
        expect(debateTopicFormCss).toContain('.debate-topic-form__topic-input--error:focus-visible');
        expect(debateTopicFormCss).toContain('.debate-topic-form__start:focus-visible');
        expect(debateTopicFormCss).toContain('outline: 2px solid var(--color-primary);');
        expect(debateTopicFormCss).toContain('.debate-topic-form__cancel:focus-visible');
        expect(debateTopicFormCss).toContain("[data-theme='dark'] .debate-topic-form__start:disabled");
        expect(debateTopicFormCss).toContain(':root:not([data-theme]) .debate-topic-form__start:disabled');
    });
});
