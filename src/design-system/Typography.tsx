import type { ReactNode, JSX } from 'react';
import './typography.css';

type TypographyRole = 'headline-large' | 'body-large' | 'label-medium';

interface TypographyProps {
  role: TypographyRole;
  as?: keyof JSX.IntrinsicElements;
  children: ReactNode;
  className?: string;
}

const defaultElements: Record<TypographyRole, keyof JSX.IntrinsicElements> = {
  'headline-large': 'h1',
  'body-large': 'p',
  'label-medium': 'span',
};

export function Typography({ role, as, children, className }: TypographyProps) {
  const Component = as ?? defaultElements[role];
  const classes = ['typography', `typography--${role}`, className]
    .filter(Boolean)
    .join(' ');

  return <Component className={classes}>{children}</Component>;
}
