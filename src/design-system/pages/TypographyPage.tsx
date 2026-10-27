import { useState, type CSSProperties } from 'react';
import { Callout, Code, DoDont, PageTitle, Prose, Section, Table, UsedIn } from '../components/Doc/Doc';
import { CodeBlock } from '../components/CodeBlock/CodeBlock';
import { CopyTooltip } from '../components/CopyTooltip/CopyTooltip';
import { SegmentedControl } from '../components/SegmentedControl/SegmentedControl';
import { ExportBar } from '../components/ExportBar/ExportBar';
import { styleCss } from '../lib/export';
import { parseFontShorthand, tokensWithPrefix, trackingFor, type Token } from '../lib/tokens';
import styles from './Foundations.module.css';

const WEIGHTS = ['bold', 'medium', 'regular'] as const;
type Weight = (typeof WEIGHTS)[number];

const WEIGHT_NAME: Record<number, string> = { 400: 'Regular', 500: 'Medium', 510: 'Medium', 590: 'Semibold', 600: 'Semibold' };

/** A style row: one name (e.g. "H2") with up to three weights. */
type StyleRow = { key: string; tokens: Partial<Record<Weight, Token>>; single?: Token };

/** Groups --type-* tokens into rows, in tokens.css order. */
function buildRows(): StyleRow[] {
  const rows = new Map<string, StyleRow>();
  for (const token of tokensWithPrefix('--type-')) {
    if (!parseFontShorthand(token.value)) continue;
    // Buttons are sizes (Large/Medium/Small), not weights, so each is its own row.
    const match = !token.name.startsWith('--type-button-') && token.name.match(/^--type-([\w-]+?)-(bold|medium|regular)$/);
    if (match) {
      const row = rows.get(match[1]) ?? { key: match[1], tokens: {} };
      row.tokens[match[2] as Weight] = token;
      rows.set(match[1], row);
    } else {
      const key = token.name.replace('--type-', '');
      rows.set(key, { key, tokens: {}, single: token });
    }
  }
  return [...rows.values()];
}

const isDisplay = (token: Token) => token.value.includes('--font-family-display');

/** Inline style that renders a token exactly, tracking and CAPS case included. */
function styleFor(token: Token): CSSProperties {
  const tracking = trackingFor(token.name);
  return {
    font: `var(${token.name})`,
    letterSpacing: tracking ? `var(${tracking.name})` : undefined,
    textTransform: token.name === '--type-caps' ? 'uppercase' : undefined,
  };
}

/** Figma style name from the token's comment, e.g. "H5/Bold". */
const figmaName = (token: Token) => token.note?.split(' (')[0] ?? token.name;

function Spec({ token }: { token: Token }) {
  const font = parseFontShorthand(token.value)!;
  const tracking = trackingFor(token.name);
  return (
    <span className={styles.scaleSpec}>
      {font.size} / {font.lineHeight} · {WEIGHT_NAME[font.weight] ?? font.weight} {font.weight}
      {tracking && ` · ${tracking.value}`}
    </span>
  );
}

const usageExample = `/* A heading: style + its tracking */
.pageTitle {
  font: var(--type-h5-bold);
  letter-spacing: var(--type-h5-tracking);
}

/* Text styles without tracking need only the font */
.title {
  font: var(--type-small-bold);
}

/* CAPS also needs its case */
.label {
  font: var(--type-caps);
  letter-spacing: var(--type-caps-tracking);
  text-transform: uppercase;
}`;

/** Where the sheet's written labels disagree with the styles Figma applies (76:754). */
const CONFLICTS = [
  ['Font family', 'Clash Display / SF Pro', 'Instrument Sans / Inter', 'Labels (agreed with design)'],
  ['H5 line height', '40px', '36px', 'Applied'],
  ['H6 tracking', '-0.1px', '0.4px', 'Applied'],
  ['Large/Bold tracking', '-0.1px', '0px', 'Applied'],
  ['Small/Bold tracking', '0px', '0.1px', 'Applied'],
  ['Button/Medium', '14px / 22px Semibold', '13px / 20px Medium, 0.1px', 'Applied'],
  ['Button/Small', '12px / 20px', '12px / 18px, 0.1px', 'Applied'],
  ['Button/Large', '16px / 24px Semibold', '14px / 20px Medium, 0.1px', 'Neither: the Button component still binds 590 14px / 22px'],
];

export function TypographyPage() {
  const [weight, setWeight] = useState<Weight>('bold');
  const rows = buildRows();
  const headingRows = rows.filter((row) => Object.values(row.tokens).some((t) => t && isDisplay(t)));
  const textRows = rows.filter((row) => !headingRows.includes(row) && !row.key.startsWith('button'));
  const buttonRows = rows.filter((row) => row.key.startsWith('button'));
  const allStyles = rows.flatMap((row) => (row.single ? [row.single] : WEIGHTS.map((w) => row.tokens[w]).filter(Boolean) as Token[]));

  const families = [
    {
      name: 'Clash Display',
      token: '--font-family-display',
      role: 'Headings: H1 to Section Header',
      weights: [600, 500, 400],
    },
    {
      name: 'SF Pro',
      token: '--font-family-base',
      role: 'Text: Large and smaller, Buttons, CAPS',
      weights: [590, 510, 400],
    },
  ];

  const renderRow = (row: StyleRow) => {
    const token = row.single ?? row.tokens[weight] ?? row.tokens.bold!;
    return (
      <div key={row.key} className={styles.scaleRow}>
        <div className={styles.scaleMeta}>
          <span className={styles.scaleName}>{figmaName(token)}</span>
          <Code>{token.name}</Code>
          <Spec token={token} />
        </div>
        <div className={styles.scaleSampleCell}>
          <CopyTooltip text={styleCss(token, 'tokens')} label={`Copy ${figmaName(token)} CSS`}>
            <span className={styles.scaleSample} style={styleFor(token)}>
              {figmaName(token)}
            </span>
          </CopyTooltip>
        </div>
      </div>
    );
  };

  return (
    <>
      <PageTitle title="Typography">
        Two families from the Figma Typography sheet: Clash Display for headings and SF Pro for text. Each text
        style is one token written as the CSS <Code>font</Code> shorthand, with a separate tracking token where it
        isn’t 0.
      </PageTitle>

      <Callout>
        <p>
          Source: Figma <Code>Typography</Code> (76:754) and the card frame (24:247). Where the sheet’s written labels
          and its applied styles disagree, the applied values are used; see Figma notes at the
          bottom of this page.
        </p>
      </Callout>

      <ExportBar categories={['typography']} fileName="handoff-typography" subject="typography tokens" />

      <Section title="Font families">
        <div className={styles.familyGrid}>
          {families.map((family) => (
            <div key={family.name} className={styles.familyCard}>
              <span className={styles.familyGlyph} style={{ fontFamily: `var(${family.token})` }} aria-hidden="true">
                Aa
              </span>
              <div>
                <p className={styles.familyName} style={{ fontFamily: `var(${family.token})` }}>
                  {family.name}
                </p>
                <p className={styles.familyRole}>{family.role}</p>
                <p className={styles.familyMeta}>
                  <Code>{family.token}</Code>
                </p>
                <div className={styles.familyWeights}>
                  {family.weights.map((w) => (
                    <span key={w} style={{ fontFamily: `var(${family.token})`, fontWeight: w }}>
                      {WEIGHT_NAME[w]} {w}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
        <Callout>
          <p>
            SF Pro isn’t bundled (licensing). It loads from Apple systems and falls back to the platform UI font
            elsewhere. Clash Display is loaded from Fontshare’s stylesheet, because its licence doesn’t allow
            redistributing the files. Any page that uses heading styles needs that <Code>{'<link>'}</Code>.
          </p>
        </Callout>
      </Section>

      <Section title="Type scale">
        <Prose>
          <p>
            Headings and text come in Bold, Medium and Regular. Switch the weight to compare, and click any style to
            copy its CSS.
          </p>
        </Prose>
        <SegmentedControl
          label="Weight"
          value={weight}
          onChange={setWeight}
          options={WEIGHTS.map((w) => ({ value: w, label: w[0].toUpperCase() + w.slice(1) }))}
        />

        <h3 className={styles.scaleGroup}>Headings · Clash Display</h3>
        <div className={styles.scale}>{headingRows.map(renderRow)}</div>

        <h3 className={styles.scaleGroup}>Text · SF Pro</h3>
        <div className={styles.scale}>{textRows.map(renderRow)}</div>

        <h3 className={styles.scaleGroup}>Buttons · SF Pro</h3>
        <div className={styles.scale}>{buttonRows.map(renderRow)}</div>
      </Section>

      <Section title="All styles">
        <Table head={['Figma style', 'Token', 'Size / line height', 'Weight', 'Tracking', 'Used in']}>
          {allStyles.map((token) => {
            const font = parseFontShorthand(token.value)!;
            const tracking = trackingFor(token.name);
            return (
              <tr key={token.name}>
                <td>{figmaName(token)}</td>
                <td>
                  <Code>{token.name}</Code>
                </td>
                <td>
                  {font.size} / {font.lineHeight}
                </td>
                <td>{font.weight}</td>
                <td>{tracking ? <Code>{tracking.value}</Code> : '–'}</td>
                <td>
                  <UsedIn names={token.usedIn} />
                </td>
              </tr>
            );
          })}
        </Table>
      </Section>

      <Section title="Usage">
        <CodeBlock code={usageExample} label="Component.module.css" />
        <DoDont
          dos={[
            <>
              Set text with one token: <Code>font: var(--type-…)</Code>, plus its <Code>-tracking</Code> token if it
              has one.
            </>,
            <>Use Clash Display only for headings, and SF Pro for everything people read in running text or controls.</>,
            <>Pair a style with a text colour token, e.g. Micro/Regular with Text/neutral.</>,
          ]}
          donts={[
            <>
              Set <Code>font-size</Code> or <Code>font-weight</Code> by hand. Add a token (and a Figma style) instead.
            </>,
            <>Use heading styles below Section Header size, or text styles for page headings.</>,
            <>Use CAPS without its tracking and uppercase transform.</>,
          ]}
        />
      </Section>

      <Section title="Figma notes">
        <Prose>
          <p>
            The sheet’s hand-written labels disagree with the styles applied to its specimens in a few places. The
            Typeface labels also name different fonts than the applied styles.
          </p>
        </Prose>
        <Table head={['Property', 'Sheet label', 'Applied style', 'Used here']}>
          {CONFLICTS.map(([property, label, applied, used]) => (
            <tr key={property}>
              <td>{property}</td>
              <td>{label}</td>
              <td>{applied}</td>
              <td>{used}</td>
            </tr>
          ))}
        </Table>
        <Prose>
          <ul>
            <li>
              SF Pro weights are Figma’s SF Pro values (Semibold 590, Medium 510), as the card frame uses. The
              sheet’s Inter 600 and 500 are mapped to them; this mapping is derived.
            </li>
            <li>
              <Code>Micro/Bold</Code> and <Code>Large/Regular</Code> specimens use raw values with no Figma style;
              they’re tokens here for completeness.
            </li>
            <li>
              <Code>CAPS</Code> isn’t on the sheet. It stays because the card’s stat label uses it (frame 24:247).
            </li>
          </ul>
        </Prose>
      </Section>
    </>
  );
}
