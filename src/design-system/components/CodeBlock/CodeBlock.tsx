import { useEffect, useState } from 'react';
import { highlight } from '../../lib/highlight';
import styles from './CodeBlock.module.css';

type CodeBlockProps = {
  code: string;
  /** Shown in the block's header, e.g. a file name or "CSS". */
  label?: string;
};

export function CodeBlock({ code, label }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(timer);
  }, [copied]);

  const text = code.trimEnd();

  return (
    <div className={styles.block}>
      <div className={styles.header}>
        <span className={styles.label}>{label}</span>
        <button
          type="button"
          className={styles.copy}
          onClick={() => navigator.clipboard?.writeText(text).then(() => setCopied(true))}
        >
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className={styles.pre} tabIndex={0}>
        <code>{highlight(text)}</code>
      </pre>
    </div>
  );
}
