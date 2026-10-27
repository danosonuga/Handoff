import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { CodeBlock } from '../CodeBlock/CodeBlock';
import styles from './Example.module.css';

export type ExampleFile = { name: string; code: string };

type ExampleProps = {
  /** The example's source files, imported with `?raw` so the code always matches the preview. */
  files: ExampleFile[];
  /** Preview background: the white canvas (default) or the grey on-canvas. */
  stage?: 'canvas' | 'on-canvas';
  /** Lays the preview out at this width in px (for full-width parts such as a progress bar). */
  width?: number;
  children: ReactNode;
};

const TABS = ['Preview', 'Code'] as const;

/** Poseidon's Preview / Code tabs around a live example. */
export function Example({ files, stage = 'canvas', width, children }: ExampleProps) {
  const id = useId();
  const [tab, setTab] = useState<(typeof TABS)[number]>('Preview');
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    const next = TABS[(TABS.indexOf(tab) + 1) % TABS.length];
    setTab(next);
    tabRefs.current[TABS.indexOf(next)]?.focus();
  };

  return (
    <div className={styles.example}>
      <div role="tablist" className={styles.tabs} onKeyDown={onKeyDown}>
        {TABS.map((name, i) => (
          <button
            key={name}
            ref={(el) => {
              tabRefs.current[i] = el;
            }}
            id={`${id}-${name}-tab`}
            type="button"
            role="tab"
            className={styles.tab}
            aria-selected={tab === name}
            aria-controls={`${id}-${name}`}
            tabIndex={tab === name ? 0 : -1}
            onClick={() => setTab(name)}
          >
            {name}
          </button>
        ))}
      </div>
      {/* Both panels stay mounted so the preview keeps its state while the code is shown. */}
      <div
        id={`${id}-Preview`}
        role="tabpanel"
        aria-labelledby={`${id}-Preview-tab`}
        className={styles.stage}
        data-stage={stage}
        hidden={tab !== 'Preview'}
      >
        {width ? (
          <div className={styles.frame} style={{ maxWidth: width }}>
            {children}
          </div>
        ) : (
          children
        )}
      </div>
      <div id={`${id}-Code`} role="tabpanel" aria-labelledby={`${id}-Code-tab`} className={styles.codePanel} hidden={tab !== 'Code'}>
        {files.map((file) => (
          <CodeBlock key={file.name} code={file.code} label={file.name} />
        ))}
      </div>
    </div>
  );
}
