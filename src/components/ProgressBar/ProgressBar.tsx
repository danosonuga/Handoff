import type { CSSProperties } from 'react';
import styles from './ProgressBar.module.css';

type ProgressBarProps = {
  value: number;
  max: number;
  /** Accessible name, e.g. "Volunteers joined". */
  label: string;
};

/** Continuous progress track; the fill grows with value / max. */
export function ProgressBar({ value, max, label }: ProgressBarProps) {
  const ratio = max > 0 ? Math.min(Math.max(value / max, 0), 1) : 0;
  const style = { '--progress': `${ratio * 100}%` } as CSSProperties;

  return (
    <div
      className={styles.root}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-valuetext={`${value} of ${max}`}
    >
      <div className={styles.track}>
        <div className={styles.fill} style={style} />
      </div>
    </div>
  );
}
