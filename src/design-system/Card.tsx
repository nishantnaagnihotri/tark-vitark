import type { AriaAttributes, ReactNode } from 'react';
import './card.css';

type Side = 'tark' | 'vitark';

interface CardProps extends AriaAttributes {
    side: Side;
    children: ReactNode;
    className?: string;
    id?: string;
    role?: string;
}

export function Card({ side, children, className, ...rest }: CardProps) {
    const classes = ['card', `card--${side}`, className]
        .filter(Boolean)
        .join(' ');

    return <div className={classes} {...rest}>{children}</div>;
}
