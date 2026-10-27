import { Callout, Code, DoDont, PageTitle, Prose, Section, Table, UsedIn } from '../components/Doc/Doc';
import { CodeBlock } from '../components/CodeBlock/CodeBlock';
import { getToken, parseFontShorthand, tokensWithPrefix } from '../lib/tokens';
import styles from './Foundations.module.css';

/** Sample copy for each style, taken from where the card uses it. */
const SAMPLE: Record<string, string> = {
  '--type-small-bold': 'Weekend Teaching Program at Makoko Community',
  '--type-button-large': 'Join as a volunteer',
  '--type-micro-bold': '20',
  '--type-micro-medium': '4 volunteers joined',
  '--type-micro-regular': 'Education First Nigeria',
  '--type-caps': 'Volunteers needed',
};

const WEIGHT_NAME: Record<number, string> = { 400: 'Regular', 510: 'Medium', 590: 'Semibold', 700: 'Bold' };

const usageExample = `.title {
  font: var(--type-small-bold);
}

/* CAPS also needs its tracking and case. */
.label {
  font: var(--type-caps);
  letter-spacing: var(--type-caps-tracking);
  text-transform: uppercase;
}`;

export function TypographyPage() {
  const styleTokens = tokensWithPrefix('--type-').filter((token) => parseFontShorthand(token.value));
  const family = getToken('--font-family-base');
  const tracking = getToken('--type-caps-tracking');
  const weights = [...new Set(styleTokens.map((token) => parseFontShorthand(token.value)!.weight))].sort((a, b) => a - b);

  return (
    <>
      <PageTitle title="Typography">
        One family, SF Pro, in six text styles. Each Figma text style is a single token written as the CSS{' '}
        <Code>font</Code> shorthand, so weight, size, line height and family always travel together.
      </PageTitle>

      <Section title="Font family">
        <div className={styles.familyCard}>
          <span className={styles.familyGlyph} aria-hidden="true">
            Aa
          </span>
          <div>
            <p className={styles.familyName}>SF Pro</p>
            <p className={styles.familyMeta}>
              <Code>--font-family-base</Code>
            </p>
            <p className={styles.familyStack}>{family?.value}</p>
          </div>
        </div>
        <Callout>
          <p>
            SF Pro isn’t bundled (licensing). It loads from Apple systems and falls back to the platform UI font
            elsewhere. Weights 510 and 590 are exact only on Apple platforms.
          </p>
        </Callout>
      </Section>

      <Section title="Weights">
        <div className={styles.weights}>
          {weights.map((weight) => (
            <div key={weight} className={styles.weight}>
              <span className={styles.weightSample} style={{ fontWeight: weight }}>
                Aa
              </span>
              <span className={styles.weightName}>{WEIGHT_NAME[weight] ?? weight}</span>
              <Code>{weight}</Code>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Type scale">
        <Prose>
          <p>
            Styles keep their Figma names. The scale is compact: card UI tops out at 14px, and <em>Micro</em> (12px) is
            the workhorse for supporting text.
          </p>
        </Prose>
        <div className={styles.scale}>
          {styleTokens.map((token) => {
            const font = parseFontShorthand(token.value)!;
            const caps = token.name === '--type-caps';
            return (
              <div key={token.name} className={styles.scaleRow}>
                <div className={styles.scaleMeta}>
                  <span className={styles.scaleName}>{token.note}</span>
                  <Code>{token.name}</Code>
                  <span className={styles.scaleSpec}>
                    {WEIGHT_NAME[font.weight] ?? font.weight} {font.weight} · {font.size} / {font.lineHeight}
                    {caps && ` · ${tracking?.value} tracking · uppercase`}
                  </span>
                </div>
                <p
                  className={styles.scaleSample}
                  style={{
                    font: `var(${token.name})`,
                    letterSpacing: caps ? 'var(--type-caps-tracking)' : undefined,
                    textTransform: caps ? 'uppercase' : undefined,
                  }}
                >
                  {SAMPLE[token.name] ?? 'The quick brown fox'}
                </p>
              </div>
            );
          })}
        </div>
        <Table head={['Style', 'Token', 'Weight', 'Size / line height', 'Used in']}>
          {styleTokens.map((token) => {
            const font = parseFontShorthand(token.value)!;
            return (
              <tr key={token.name}>
                <td>{token.note}</td>
                <td>
                  <Code>{token.name}</Code>
                </td>
                <td>{font.weight}</td>
                <td>
                  {font.size} / {font.lineHeight}
                </td>
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
              Set text with one token: <Code>font: var(--type-…)</Code>.
            </>,
            <>Pair a style with a text colour token, e.g. Micro/Regular with Text/neutral.</>,
            <>Truncate or clamp long text (the title clamps to 2 lines) rather than shrinking it.</>,
          ]}
          donts={[
            <>
              Set <Code>font-size</Code> or <Code>font-weight</Code> by hand. Add a token (and a Figma style) instead.
            </>,
            <>Use CAPS without its tracking and uppercase transform.</>,
            <>Use 590 weight for long passages; it’s for short labels and titles.</>,
          ]}
        />
      </Section>
    </>
  );
}
