import { useRef, type ReactNode } from 'react';
import { useClipIndicator } from '../../lib/useClipIndicator';
import styles from './SegmentedControl.module.css';

type Option<T> = { value: T; label: ReactNode };

type SegmentedControlProps<T extends string | number> = {
  /** Accessible name for the group, e.g. "Weight". */
  label: string;
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
};

/** A small radio group whose selection glides between options (clip-path indicator). */
export function SegmentedControl<T extends string | number>({ label, options, value, onChange }: SegmentedControlProps<T>) {
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  useClipIndicator(rootRef, overlayRef, () => listRef.current?.querySelector<HTMLElement>('[aria-checked="true"]'), value);

  return (
    <div ref={rootRef} className={styles.root}>
      <div ref={listRef} className={styles.list} role="radiogroup" aria-label={label}>
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={option.value === value}
            className={styles.option}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
      {/* The selected style, clipped to the selected option. */}
      <div ref={overlayRef} className={`${styles.list} ${styles.overlay}`} aria-hidden="true" inert>
        {options.map((option) => (
          <span key={option.value} className={`${styles.option} ${styles.selected}`}>
            {option.label}
          </span>
        ))}
      </div>
    </div>
  );
}
