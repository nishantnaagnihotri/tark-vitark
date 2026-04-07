import type { Argument } from '../data/debate';
import { Card, Typography } from '../design-system';
import '../styles/components/argument-card.css';

interface ArgumentCardProps {
    argument: Argument;
}

const ariaLabels = {
    tark: 'Tark argument',
    vitark: 'Vitark argument',
} as const;

export function ArgumentCard({ argument }: ArgumentCardProps) {
    return (
        <Card
            side={argument.side}
            className={`argument-card argument-card--${argument.side}`}
            aria-label={ariaLabels[argument.side]}
        >
            <Typography role="body-large">{argument.text}</Typography>
        </Card>
    );
}
