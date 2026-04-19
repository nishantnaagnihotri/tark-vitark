import type { CSSProperties, FormEvent, KeyboardEvent, PointerEvent } from 'react';
import { useEffect, useRef, useState } from 'react';
import type { Side } from '../data/debate';
import { validatePost } from '../lib/validatePost';
import '../styles/components/podium-bottom-sheet.css';
import { SegmentedControl } from './SegmentedControl';

export interface PodiumBottomSheetProps {
    isOpen: boolean;
    selectedSide: Side;
    onSideChange: (side: Side) => void;
    onPublish: (text: string, side: Side) => void;
    onClose: () => void;
}

const DISMISS_DRAG_THRESHOLD = 80;
const SIDE_OPTIONS: readonly Side[] = ['tark', 'vitark'];
const FOCUSABLE_SELECTOR =
    'button:not([disabled]):not([tabindex="-1"]), [href], input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function PodiumBottomSheet({
    isOpen,
    selectedSide,
    onSideChange,
    onPublish,
    onClose,
}: PodiumBottomSheetProps) {
    const [text, setText] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isBusy, setIsBusy] = useState(false);
    const [dragOffset, setDragOffset] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [hasEntered, setHasEntered] = useState(false);
    const dragStartYRef = useRef<number | null>(null);
    const dragOffsetRef = useRef(0);
    const dialogRef = useRef<HTMLDivElement | null>(null);

    const getFocusableElements = (): HTMLElement[] => {
        const dialogNode = dialogRef.current;
        if (!dialogNode) {
            return [];
        }

        return Array.from(dialogNode.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
    };

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const focusableElements = getFocusableElements();
        focusableElements[0]?.focus();
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) {
            setHasEntered(false);
            return;
        }

        const animationFrameId = window.requestAnimationFrame(() => {
            setHasEntered(true);
        });

        return () => {
            window.cancelAnimationFrame(animationFrameId);
        };
    }, [isOpen]);

    const completeDrag = (endClientY?: number) => {
        const startClientY = dragStartYRef.current;
        if (startClientY === null) {
            return;
        }

        setIsDragging(false);
        dragStartYRef.current = null;
        const resolvedDragOffset =
            endClientY === undefined
                ? dragOffsetRef.current
                : Math.max(0, endClientY - startClientY);
        dragOffsetRef.current = 0;

        if (resolvedDragOffset > DISMISS_DRAG_THRESHOLD) {
            onClose();
            return;
        }

        setDragOffset(0);
    };

    const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
        dragStartYRef.current = event.clientY;
        setIsDragging(true);
        dragOffsetRef.current = 0;
        setDragOffset(0);
        event.currentTarget.setPointerCapture?.(event.pointerId);
    };

    const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
        if (dragStartYRef.current === null) {
            return;
        }

        const deltaY = Math.max(0, event.clientY - dragStartYRef.current);
        dragOffsetRef.current = deltaY;
        setDragOffset(deltaY);
    };

    const handleDialogKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Escape') {
            event.preventDefault();
            onClose();
            return;
        }

        if (event.key !== 'Tab') {
            return;
        }

        const focusableElements = getFocusableElements();
        if (focusableElements.length === 0) {
            return;
        }

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        const activeElement = document.activeElement as HTMLElement | null;

        if (event.shiftKey && activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
            return;
        }

        if (!event.shiftKey && activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
        }
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (isBusy) {
            return;
        }

        const validation = validatePost(text);
        if (!validation.valid) {
            setError(validation.message);
            return;
        }

        setError(null);
        setIsBusy(true);

        try {
            await Promise.resolve(onPublish(text.trim(), selectedSide));
            setText('');
        } finally {
            setIsBusy(false);
        }
    };

    if (!isOpen) {
        return null;
    }

    const sheetStyle = {
        '--podium-sheet-drag-offset': `${dragOffset}px`,
    } as CSSProperties;

    return (
        <>
            <div
                className="podium-sheet-scrim"
                aria-hidden="true"
                data-testid="podium-sheet-scrim"
                onClick={onClose}
            />
            <div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-label="Post composer"
                className={`podium-bottom-sheet${hasEntered ? ' podium-bottom-sheet--open' : ''}${
                    isDragging ? ' podium-bottom-sheet--dragging' : ''
                }`}
                style={sheetStyle}
                onKeyDown={handleDialogKeyDown}
            >
                <div
                    className="podium-bottom-sheet__handle"
                    aria-hidden="true"
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={(event) => completeDrag(event.clientY)}
                    onPointerCancel={() => completeDrag()}
                />
                <button
                    type="button"
                    className="podium-bottom-sheet__close"
                    aria-label="Close post composer"
                    onClick={onClose}
                >
                    ×
                </button>
                <form className="podium-bottom-sheet__form" onSubmit={handleSubmit} aria-label="Post composer">
                    <SegmentedControl
                        options={SIDE_OPTIONS}
                        value={selectedSide}
                        onChange={onSideChange}
                    />
                    <textarea
                        className="podium-bottom-sheet__textarea"
                        value={text}
                        onChange={(event) => setText(event.target.value)}
                        placeholder="Post text…"
                        aria-label="Post text"
                        aria-describedby="sheet-podium-error"
                        aria-invalid={error !== null}
                    />
                    <button
                        type="submit"
                        className="podium-bottom-sheet__publish"
                        aria-label="Publish post"
                        disabled={isBusy}
                    >
                        Publish ↑
                    </button>
                    <p
                        id="sheet-podium-error"
                        className="podium-bottom-sheet__error"
                        role="alert"
                        aria-live="polite"
                    >
                        {error ?? ''}
                    </p>
                </form>
            </div>
        </>
    );
}
