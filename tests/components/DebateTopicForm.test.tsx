import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DebateTopicForm } from '../../src/components/DebateTopicForm';

const debateTopicFormCss = readFileSync(
    resolve(process.cwd(), 'src/styles/components/debate-topic-form.css'),
    'utf-8'
);

describe('DebateTopicForm', () => {
    it('AC-30 starts empty-state create flow with disabled Start and 0 / 120 counter', () => {
        const onSubmitTopic = vi.fn();
        render(<DebateTopicForm mode="create" onSubmitTopic={onSubmitTopic} />);

        expect(screen.getByRole('textbox', { name: 'Debate topic' })).toHaveValue('');
        expect(screen.getByText('0 / 120')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Start debate' })).toBeDisabled();
        expect(
            screen.queryByText('⚠  You already have an active debate.', { exact: false })
        ).not.toBeInTheDocument();
    });

    it('AC-29 enables Start from trimmed canonical length and submits canonical topic value', () => {
        const onSubmitTopic = vi.fn();
        render(<DebateTopicForm mode="create" onSubmitTopic={onSubmitTopic} />);

        const topicField = screen.getByRole('textbox', { name: 'Debate topic' });
        fireEvent.change(topicField, {
            target: { value: '   Is remote work better than office work?   ' },
        });

        expect(screen.getByText('39 / 120')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Start debate' })).toBeEnabled();

        fireEvent.click(screen.getByRole('button', { name: 'Start debate' }));

        expect(onSubmitTopic).toHaveBeenCalledTimes(1);
        expect(onSubmitTopic).toHaveBeenCalledWith('Is remote work better than office work?');
    });

    it('AC-31 keeps Start disabled for too-short canonical topic and shows no error copy', () => {
        const onSubmitTopic = vi.fn();
        render(<DebateTopicForm mode="create" onSubmitTopic={onSubmitTopic} />);

        fireEvent.change(screen.getByRole('textbox', { name: 'Debate topic' }), {
            target: { value: '   short   ' },
        });

        expect(screen.getByText('5 / 120')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Start debate' })).toBeDisabled();
        expect(
            screen.queryByText('Topic must be 120 characters or fewer.')
        ).not.toBeInTheDocument();
        expect(onSubmitTopic).not.toHaveBeenCalled();
    });

    it('AC-31 keeps Start disabled and shows too-long guidance when canonical topic exceeds 120', () => {
        const onSubmitTopic = vi.fn();
        render(<DebateTopicForm mode="create" onSubmitTopic={onSubmitTopic} />);

        fireEvent.change(screen.getByRole('textbox', { name: 'Debate topic' }), {
            target: { value: 'a'.repeat(121) },
        });

        expect(screen.getByText('121 / 120')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Start debate' })).toBeDisabled();
        expect(screen.getByText('Topic must be 120 characters or fewer.')).toBeInTheDocument();
    });

    it('AC-30 and AC-40 support replace-flow variant with inline warning and domain callbacks', () => {
        const onSubmitTopic = vi.fn();
        const onCancelReplace = vi.fn();
        render(
            <DebateTopicForm
                mode="replace"
                initialTopic="Is climate change the defining issue of our generation?"
                onSubmitTopic={onSubmitTopic}
                onCancelReplace={onCancelReplace}
            />
        );

        expect(screen.getByText(/You already have an active debate\./)).toBeInTheDocument();
        expect(screen.getByText('Starting a new one will replace it.')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Cancel debate replacement' })).toBeInTheDocument();
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('AC-35 lets Cancel abandon replace flow without storage side effects', () => {
        const onSubmitTopic = vi.fn();
        const onCancelReplace = vi.fn();
        const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');

        render(
            <DebateTopicForm
                mode="replace"
                initialTopic="Is climate change the defining issue of our generation?"
                onSubmitTopic={onSubmitTopic}
                onCancelReplace={onCancelReplace}
            />
        );

        fireEvent.click(screen.getByRole('button', { name: 'Cancel debate replacement' }));

        expect(onCancelReplace).toHaveBeenCalledTimes(1);
        expect(onSubmitTopic).not.toHaveBeenCalled();
        expect(setItemSpy).not.toHaveBeenCalled();
        setItemSpy.mockRestore();
    });

    it('AC-30 keeps shared topic-capture visuals aligned with the debate topic contract', () => {
        expect(debateTopicFormCss).toContain('max-width: 390px;');
        expect(debateTopicFormCss).toContain('width: 48px;');
        expect(debateTopicFormCss).toContain('height: 48px;');
        expect(debateTopicFormCss).toContain('max-width: 358px;');
        expect(debateTopicFormCss).toContain('height: 56px;');
        expect(debateTopicFormCss).toContain('min-height: 40px;');
        expect(debateTopicFormCss).toContain('min-width: 82px;');
        expect(debateTopicFormCss).toContain('min-width: 68px;');
        expect(debateTopicFormCss).toContain('var(--radius-pill)');
        expect(debateTopicFormCss).toContain('var(--color-surface-default)');
        expect(debateTopicFormCss).toContain('var(--color-outline)');
        expect(debateTopicFormCss).toContain('var(--color-error)');
        expect(debateTopicFormCss).toContain('var(--color-brand-primary)');
        expect(debateTopicFormCss).toContain('var(--color-brand-on-primary)');
        expect(debateTopicFormCss).not.toMatch(/#[0-9a-fA-F]{3,8}/);
    });
});
