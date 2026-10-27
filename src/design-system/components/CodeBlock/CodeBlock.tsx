import { highlight } from '../../lib/highlight';
import { CopyButton } from '../CopyButton/CopyButton';
import styles from './CodeBlock.module.css';

type CodeBlockProps = {
  code: string;
  /** Shown in the block's header, e.g. a file name or "CSS". */
  label?: string;
};

export function CodeBlock({ code, label }: CodeBlockProps) {
  const text = code.trimEnd();

  return (
    <div className={styles.block}>
      <div className={styles.header}>
        <span className={styles.label}>{label}</span>
        <CopyButton text={text} label={label ? `Copy ${label}` : 'Copy code'}>
          Copy
        </CopyButton>
      </div>
      <pre className={styles.pre} tabIndex={0}>
        <code>{highlight(text)}</code>
      </pre>
    </div>
  );
}
