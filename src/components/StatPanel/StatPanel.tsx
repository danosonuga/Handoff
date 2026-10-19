import type { ReactNode } from 'react';
import styles from './StatPanel.module.css';

type StatPanelProps = {
  label: string;
  value: ReactNode;
  /** Supporting content below the stat, e.g. a progress bar. */
  children?: ReactNode;
};

/** Soft panel with a caps label, a value and optional supporting content. */
export function StatPanel({ label, value, children }: StatPanelProps) {
  return (
    <div className={styles.panel}>
      <dl className={styles.stat}>
        <dt className={styles.label}>{label}</dt>
        <dd className={styles.value}>{value}</dd>
      </dl>
      {children}
    </div>
  );
}
