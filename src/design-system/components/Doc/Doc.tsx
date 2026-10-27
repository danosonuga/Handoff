import type { ReactNode } from 'react';
import styles from './Doc.module.css';

/**
 * Page building blocks for the docs (Poseidon's MDX elements, as React):
 * title, sections, prose, callouts and tables.
 */

const slug = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

export function PageTitle({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <>
      <h1 className={styles.title}>{title}</h1>
      {children && <p className={styles.lead}>{children}</p>}
    </>
  );
}

/** An h2 section; it appears in "On This Page". */
export function Section({ title, children }: { title: string; children: ReactNode }) {
  const id = slug(title);
  return (
    <section className={styles.section} aria-labelledby={id}>
      <h2 id={id} className={styles.h2} data-title={title}>
        {title}
        <a className={styles.anchor} href={`#${id}`} aria-hidden="true" tabIndex={-1} onClick={(e) => {
          e.preventDefault();
          document.getElementById(id)?.scrollIntoView();
        }}>
          #
        </a>
      </h2>
      {children}
    </section>
  );
}

export function SubHeading({ children }: { children: ReactNode }) {
  return <h3 className={styles.h3}>{children}</h3>;
}

export function Prose({ children }: { children: ReactNode }) {
  return <div className={styles.prose}>{children}</div>;
}

export function Callout({ icon = '💡', tone = 'info', children }: { icon?: string; tone?: 'info' | 'warning'; children: ReactNode }) {
  return (
    <div className={styles.callout} data-tone={tone}>
      <span className={styles.calloutIcon} aria-hidden="true">
        {icon}
      </span>
      <div>{children}</div>
    </div>
  );
}

/** Bordered table, as on Poseidon's props tables. */
export function Table({ head, children }: { head: ReactNode[]; children: ReactNode }) {
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            {head.map((cell, i) => (
              <th key={i} scope="col">
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export type PropRow = { name: string; type: string; description: ReactNode; defaultValue?: string };

export function PropsTable({ rows }: { rows: PropRow[] }) {
  return (
    <Table head={['Prop Name', 'Type', 'Description', 'Default']}>
      {rows.map((row) => (
        <tr key={row.name}>
          <td>
            <code className={styles.code}>{row.name}</code>
          </td>
          <td>
            <code className={`${styles.code} ${styles.typeCode}`}>{row.type}</code>
          </td>
          <td>{row.description}</td>
          <td>{row.defaultValue ? <code className={styles.code}>{row.defaultValue}</code> : '–'}</td>
        </tr>
      ))}
    </Table>
  );
}

export function Code({ children }: { children: ReactNode }) {
  return <code className={styles.code}>{children}</code>;
}

/** "Used in" chips for a token. */
export function UsedIn({ names }: { names: string[] }) {
  if (names.length === 0) return <span className={styles.unused}>Not used yet</span>;
  return (
    <span className={styles.chips}>
      {names.map((name) => (
        <span key={name} className={styles.chip}>
          {name}
        </span>
      ))}
    </span>
  );
}

/** Side-by-side guidance: what to do, what to avoid. */
export function DoDont({ dos, donts }: { dos: ReactNode[]; donts: ReactNode[] }) {
  return (
    <div className={styles.doDont}>
      <div className={styles.do}>
        <p className={styles.doDontLabel}>Do</p>
        <ul>
          {dos.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </div>
      <div className={styles.dont}>
        <p className={styles.doDontLabel}>Don’t</p>
        <ul>
          {donts.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
