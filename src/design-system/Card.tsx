import type { ReactNode } from 'react';
import './card.css';

type Side = 'tark' | 'vitark';

interface CardProps {
  side: Side;
  children: ReactNode;
  className?: string;
}

export function Card({ side, children, className }: CardProps) {
  const classes = ['card', `card--${side}`, className]
    .filter(Boolean)
    .join(' ');

  return <div className={classes}>{children}</div>;
}
