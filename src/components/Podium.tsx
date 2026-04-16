import type { FormEvent } from 'react';
import { useState } from 'react';
import type { Side } from '../data/debate';
import { validatePost } from '../lib/validatePost';
import '../styles/components/podium.css';

interface PodiumProps {
    selectedSide: Side;
    onSideChange: (side: Side) => void;
    onPublish: (text: string, side: Side) => void;
}

export function Podium({ selectedSide, onSideChange, onPublish }: PodiumProps) {
    const [text, setText] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isBusy, setIsBusy] = useState(false);

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

    const sideLabel = selectedSide === 'tark' ? 'Tark' : 'Vitark';
    const nextSide: Side = selectedSide === 'tark' ? 'vitark' : 'tark';

    return (
        <form className="podium" onSubmit={handleSubmit} aria-label="Post composer">
            {/* Divider/Native: inline horizontal separator, not DS Divider. */}
            <div className="podium__divider" role="separator" aria-orientation="horizontal" />

            <div className="podium__composer-row">
                <button
                    type="button"
                    className={`podium__chip podium__chip--${selectedSide}`}
                    aria-label={`Post as ${sideLabel}`}
                    onClick={() => onSideChange(nextSide)}
                >
                    {sideLabel}
                </button>
                <textarea
                    className="podium__textarea"
                    value={text}
                    onChange={(event) => setText(event.target.value)}
                    placeholder="Post text"
                    aria-label="Post text"
                    aria-describedby="podium-error"
                    aria-invalid={error !== null}
                />

                <button
                    type="submit"
                    className="podium__publish"
                    disabled={text.length === 0 || isBusy}
                    aria-label="Publish post"
                >
                    <span aria-hidden="true">&uarr;</span>
                </button>
            </div>

            <p id="podium-error" className="podium__error" role="alert" aria-live="polite">
                {error ?? ''}
            </p>
        </form>
    );
}