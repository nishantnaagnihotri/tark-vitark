import { Typography } from '../design-system';

interface TopicProps {
    text: string;
}

export function Topic({ text }: TopicProps) {
    return (
        <Typography role="headline-large" as="h1" className="topic">
            {text}
        </Typography>
    );
}
