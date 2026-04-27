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

describe('DebateTopicForm', () => {
    it('shows the create flow with Start disabled at 0 / 120 (AC-29)', () => {
        render(<DebateTopicForm mode="create" onStartDebate={vi.fn()} />);

        expect(screen.getByRole('textbox', { name: 'Debate topic' })).toHaveValue('');
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

    it('pins topic-form geometry and token usage to Figma values for create and replace states', () => {
        expect(debateTopicFormCss).toContain('max-width: 358px;');
        expect(debateTopicFormCss).toContain('height: 56px;');
        expect(debateTopicFormCss).toContain('padding: 0 15px;');
        expect(debateTopicFormCss).toContain('height: 40px;');
        expect(debateTopicFormCss).toContain('padding: 0 24px;');
        expect(debateTopicFormCss).toContain('padding: 0 12px;');
        expect(debateTopicFormCss).toContain('border-radius: 4px;');
        expect(debateTopicFormCss).toContain('border-radius: 20px;');
        expect(debateTopicFormCss).toContain('var(--color-outline)');
        expect(debateTopicFormCss).toContain('var(--color-error)');
        expect(debateTopicFormCss).toContain('var(--color-primary)');
        expect(debateTopicFormCss).toContain('var(--color-on-primary)');
        expect(debateTopicFormCss).toContain('var(--color-surface-container-highest)');
        expect(debateTopicFormCss).toContain('var(--color-on-surface-variant)');
    });
});
