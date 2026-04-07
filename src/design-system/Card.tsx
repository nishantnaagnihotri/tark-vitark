import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import './card.css';

type Side = 'tark' | 'vitark';

interface CardProps extends ComponentPropsWithoutRef<'div'> {
    side: Side;
    children: ReactNode;
}

export function Card({ side, children, className, ...rest }: CardProps) {
    const classes = ['card', `card--${side}`, className]
        .filter(Boolean)
        .join(' ');

    return <div className={classes} {...rest}>{children}</div>;
}
