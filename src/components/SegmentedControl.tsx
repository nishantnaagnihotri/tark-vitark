import type { KeyboardEvent } from 'react';
import { useRef } from 'react';
import '../styles/components/segmented-control.css';

interface SegmentedControlProps<T extends string> {
    options: readonly T[];
    value: T;
    onChange: (value: T) => void;
    id?: string;
    'aria-label'?: string;
    'aria-labelledby'?: string;
}

function toSegmentLabel(option: string): string {
    return option.charAt(0).toUpperCase() + option.slice(1);
}

export function SegmentedControl<T extends string>({
    options,
    value,
    onChange,
    id,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledby,
}: SegmentedControlProps<T>) {
    const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
    const effectiveValue = options.includes(value) ? value : options[0] ?? value;
    const selectedIndex = options.indexOf(effectiveValue);
    const labelledByValue = ariaLabelledby?.trim();
    const labelValue = ariaLabel?.trim();
    const radiogroupNameProps = labelledByValue
        ? { 'aria-labelledby': labelledByValue }
        : { 'aria-label': labelValue || 'Side selection' };

    const focusAndSelect = (nextIndex: number) => {
        if (options.length === 0) return;

        const wrappedIndex = (nextIndex + options.length) % options.length;
        const nextOption = options[wrappedIndex];
        if (nextOption === effectiveValue) {
            optionRefs.current[wrappedIndex]?.focus();
            return;
        }

        onChange(nextOption);
        optionRefs.current[wrappedIndex]?.focus();
    };

    const selectOnConfirm = (option: T) => {
        if (option !== effectiveValue) {
            onChange(option);
        }
    };

    const handleOptionKeyDown = (
        event: KeyboardEvent<HTMLButtonElement>,
        optionIndex: number,
        option: T
    ) => {
        switch (event.key) {
            case 'ArrowRight':
            case 'ArrowDown': {
                event.preventDefault();
                focusAndSelect(optionIndex + 1);
                return;
            }
            case 'ArrowLeft':
            case 'ArrowUp': {
                event.preventDefault();
                focusAndSelect(optionIndex - 1);
                return;
            }
            case ' ':
            case 'Spacebar':
            case 'Enter': {
                event.preventDefault();
                selectOnConfirm(option);
                return;
            }
            default:
                return;
        }
    };

    return (
        <div
            id={id}
            className="segmented-control"
            role="radiogroup"
            {...radiogroupNameProps}
        >
            {options.map((option, optionIndex) => {
                const isSelected = option === effectiveValue;

                return (
                    <button
                        key={`${option}-${optionIndex}`}
                        type="button"
                        ref={(node) => {
                            optionRefs.current[optionIndex] = node;
                        }}
                        role="radio"
                        className={`segmented-control__segment${
                            isSelected ? ' segmented-control__segment--selected' : ''
                        }`}
                        aria-checked={isSelected}
                        tabIndex={optionIndex === selectedIndex ? 0 : -1}
                        onClick={() => selectOnConfirm(option)}
                        onKeyDown={(event) =>
                            handleOptionKeyDown(event, optionIndex, option)
                        }
                    >
                        <span className="segmented-control__label">
                            {toSegmentLabel(option)}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
