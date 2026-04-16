import { useEffect, useRef, useState } from 'react';
import type { Argument } from '../data/debate';
import { Card } from '../design-system';
import '../styles/components/argument-card.css';

interface ArgumentCardProps {
    argument: Argument;
}

const ariaLabels = {
    tark: 'Tark argument',
    vitark: 'Vitark argument',
} as const;

export function ArgumentCard({ argument }: ArgumentCardProps) {
    const [expanded, setExpanded] = useState(false);
    const [isClamped, setIsClamped] = useState(false);
    const bodyRef = useRef<HTMLParagraphElement | null>(null);
    const bodyId = `argument-card-body-${argument.id}`;

    useEffect(() => {
        const bodyNode = bodyRef.current;

        if (!(bodyNode instanceof HTMLParagraphElement)) {
            return;
        }

        if (expanded) {
            return;
        }

        const updateClampState = () => {
            setIsClamped(bodyNode.scrollHeight > bodyNode.clientHeight);
        };

        updateClampState();

        if (typeof ResizeObserver === 'undefined') {
            return;
        }

        const resizeObserver = new ResizeObserver(updateClampState);
        resizeObserver.observe(bodyNode);

        return () => {
            resizeObserver.disconnect();
        };
    }, [argument.text, expanded]);

    const shouldShowExpandToggle = isClamped || expanded;

    return (
        <Card
            side={argument.side}
            className={`argument-card argument-card--${argument.side}`}
            role="group"
            aria-label={ariaLabels[argument.side]}
        >
            <p
                id={bodyId}
                ref={bodyRef}
                className={`typography typography--body-large argument-card__body${expanded ? '' : ' argument-card__body--clamped'}`}
            >
                {argument.text}
            </p>
            {shouldShowExpandToggle ? (
                <button
                    type="button"
                    className="argument-card__read-more"
                    aria-expanded={expanded}
                    aria-controls={bodyId}
                    onClick={() => setExpanded((isExpanded) => !isExpanded)}
                >
                    {expanded ? 'Show less' : 'Read more'}
                </button>
            ) : null}
        </Card>
    );
}
