import type { ReactNode } from 'react';
import { download, toCss, toDesignTokensJson, type Category } from '../../lib/export';
import { CopyButton } from '../CopyButton/CopyButton';
import styles from './ExportBar.module.css';

type ExportBarProps = {
  /** What's being exported, e.g. "typography tokens". */
  subject: string;
  /** Token categories: renders Download CSS / Download JSON / Copy CSS. */
  categories?: Category[];
  /** File name without extension, e.g. "handoff-typography". */
  fileName?: string;
  /** Replaces the default description. */
  hint?: ReactNode;
  /** Custom actions (ExportAction buttons) instead of the token downloads. */
  children?: ReactNode;
};

/** A download button styled for the export bar. */
export function ExportAction({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" className={styles.action} onClick={onClick}>
      {children}
    </button>
  );
}

/** Download (or copy) a set of tokens or assets. */
export function ExportBar({ subject, categories, fileName = 'handoff', hint, children }: ExportBarProps) {
  return (
    <div className={styles.bar}>
      <div className={styles.text}>
        <p className={styles.title}>Export {subject}</p>
        <p className={styles.hint}>
          {hint ??
            'CSS custom properties, or Design Tokens JSON (W3C format) for Tokens Studio, Style Dictionary and Figma.'}
        </p>
      </div>
      <div className={styles.actions}>
        {children}
        {categories && (
          <>
            <ExportAction onClick={() => download(`${fileName}.css`, toCss(categories), 'text/css')}>
              Download CSS
            </ExportAction>
            <ExportAction
              onClick={() => download(`${fileName}.tokens.json`, toDesignTokensJson(categories), 'application/json')}
            >
              Download JSON
            </ExportAction>
            <CopyButton text={toCss(categories)} label={`Copy ${subject} as CSS`}>
              Copy CSS
            </CopyButton>
          </>
        )}
      </div>
    </div>
  );
}
