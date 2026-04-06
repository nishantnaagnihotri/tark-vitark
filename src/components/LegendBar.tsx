import { Typography } from '../design-system';
import '../styles/components/legend-bar.css';

export function LegendBar() {
    return (
        <nav className="legend-bar" aria-label="Debate sides legend">
            <span className="legend-bar__section legend-bar__section--left">
                <span className="legend-bar__legend">
                    <span
                        className="legend-bar__dot legend-bar__dot--tark"
                        aria-hidden="true"
                    />
                    <Typography role="label-medium">Tark · for</Typography>
                </span>
            </span>
            <span className="legend-bar__separator" aria-hidden="true">
                •
            </span>
            <span className="legend-bar__section legend-bar__section--right">
                <span className="legend-bar__legend">
                    <span
                        className="legend-bar__dot legend-bar__dot--vitark"
                        aria-hidden="true"
                    />
                    <Typography role="label-medium">Vitark · against</Typography>
                </span>
            </span>
        </nav>
    );
}
