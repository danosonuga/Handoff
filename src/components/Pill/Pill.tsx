import type { ReactNode } from 'react';
import styles from './Pill.module.css';

type PillProps = {
  children: ReactNode;
  className?: string;
};

/** Translucent dark chip for short status text over imagery. */
export function Pill({ children, className }: PillProps) {
  return <span className={[styles.pill, className].filter(Boolean).join(' ')}>{children}</span>;
}
