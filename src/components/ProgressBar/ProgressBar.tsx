import { useEffect, useState, type CSSProperties } from 'react';
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

  // Load-in: paint the fill at 0 first, then move to the real value on the
  // next frame so the "Card resize" transition animates it in.
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setLoaded(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const style = { '--progress': `${loaded ? ratio * 100 : 0}%` } as CSSProperties;

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
        {/* t-resize: transitions.dev "Card resize" — tweens the fill on load-in and when the value changes. */}
        <div className={`${styles.fill} t-resize`} style={style} />
      </div>
    </div>
  );
}
