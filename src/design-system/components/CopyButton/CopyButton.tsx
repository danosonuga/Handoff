import { useEffect, useState, type ReactNode } from 'react';
import styles from './CopyButton.module.css';

type CopyButtonProps = {
  /** Text put on the clipboard. */
  text: string;
  children: ReactNode;
  /** Accessible name when the visible label is ambiguous, e.g. "Copy H1/Bold as CSS". */
  label?: string;
  className?: string;
};

/** Copies `text` and confirms with "Copied" for 1.5s. */
export function CopyButton({ text, children, label, className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(timer);
  }, [copied]);

  return (
    <button
      type="button"
      className={[styles.copy, className].filter(Boolean).join(' ')}
      aria-label={label}
      onClick={() => navigator.clipboard?.writeText(text).then(() => setCopied(true))}
    >
      {copied ? 'Copied' : children}
      <span className={styles.status} role="status">
        {copied ? 'Copied to clipboard' : ''}
      </span>
    </button>
  );
}
