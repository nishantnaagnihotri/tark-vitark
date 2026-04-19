import type { Side } from '../data/debate';
import '../styles/components/podium-fab.css';

export interface PodiumFABProps {
    isExpanded: boolean;
    onExpand: () => void;
    onSideSelect: (side: Side) => void;
    onCollapse: () => void;
}

export function PodiumFAB({ isExpanded, onExpand, onSideSelect, onCollapse }: PodiumFABProps) {
    if (!isExpanded) {
        return (
            <button
                type="button"
                className="podium-fab"
                aria-label="Open post composer"
                aria-expanded="false"
                onClick={onExpand}
            >
                <span aria-hidden="true">+</span>
            </button>
        );
    }

    return (
        <div className="podium-fab podium-fab--expanded" role="group" aria-label="Post composer options">
            <button
                type="button"
                className="podium-fab__mini-btn podium-fab__mini-btn--tark"
                aria-label="Post as Tark"
                onClick={() => onSideSelect('tark')}
            >
                T
            </button>
            <button
                type="button"
                className="podium-fab__mini-btn podium-fab__mini-btn--vitark"
                aria-label="Post as Vitark"
                onClick={() => onSideSelect('vitark')}
            >
                V
            </button>
            <button
                type="button"
                className="podium-fab__dismiss"
                aria-label="Close"
                onClick={onCollapse}
            >
                ×
            </button>
        </div>
    );
}
