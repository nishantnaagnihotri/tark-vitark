import './divider.css';

interface DividerProps {
    orientation?: 'vertical';
    className?: string;
}

export function Divider({ orientation = 'vertical', className }: DividerProps) {
    const classes = ['divider', `divider--${orientation}`, className]
        .filter(Boolean)
        .join(' ');

    return (
        <div
            className={classes}
            role="separator"
            aria-orientation={orientation}
        />
    );
}
