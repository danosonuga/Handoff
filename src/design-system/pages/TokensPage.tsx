import { Callout, Code, PageTitle, Prose, Section, SubHeading, Table, UsedIn } from '../components/Doc/Doc';
import { CodeBlock } from '../components/CodeBlock/CodeBlock';
import { ExportBar } from '../components/ExportBar/ExportBar';
import { ALL_CATEGORIES } from '../lib/export';
import { resolveValue, tokensWithPrefix, type Token } from '../lib/tokens';
import styles from './Foundations.module.css';

/** Colour token groups, in the order of the Figma variable collections. */
const COLOUR_GROUPS = [
  { title: 'Text', prefix: '--color-text-', figma: 'Text/*' },
  { title: 'Icons', prefix: '--color-icon-', figma: 'Icons/*' },
  { title: 'Background', prefix: '--color-bg-', figma: 'Background/*' },
  { title: 'Buttons', prefix: '--color-button-', figma: 'Buttons/*' },
  { title: 'Cause card CTA', prefix: '--color-cta-', figma: 'raw fill (V2)' },
];

const usageExample = `.title {
  color: var(--color-text-default);
  font: var(--type-small-bold);
}

.panel {
  padding: var(--space-12);
  border-radius: var(--radius-md);
  background: var(--color-bg-on-canvas);
}`;

function Note({ token }: { token: Token }) {
  return token.note ? <span className={styles.note}>{token.note}</span> : <span className={styles.muted}>–</span>;
}

export function TokensPage() {
  const spacing = tokensWithPrefix('--space-');
  const radii = tokensWithPrefix('--radius-');
  const shadows = tokensWithPrefix('--shadow-');

  return (
    <>
      <PageTitle title="Design Tokens">
        Tokens are the named design decisions every component reads: colour, spacing, radius and elevation. They
        are CSS custom properties in <Code>src/styles/tokens.css</Code>, and each one mirrors a Figma variable so a
        design change maps to one line of code.
      </PageTitle>

      <ExportBar categories={ALL_CATEGORIES} fileName="handoff-tokens" subject="all tokens" />

      <Section title="Naming">
        <Prose>
          <p>
            Names follow the Figma variable path, lower-cased and joined with hyphens, behind a category prefix.
            <Code>Text/default</Code> becomes <Code>--color-text-default</Code>, and <Code>Buttons/primary-clicked</Code>{' '}
            becomes <Code>--color-button-primary-clicked</Code>.
          </p>
        </Prose>
        <Table head={['Category', 'Pattern', 'Example']}>
          <tr>
            <td>Colour</td>
            <td>
              <Code>--color-{'{group}'}-{'{role}'}</Code>
            </td>
            <td>
              <Code>--color-bg-on-canvas</Code>
            </td>
          </tr>
          <tr>
            <td>Typography</td>
            <td>
              <Code>--type-{'{style}'}</Code>
            </td>
            <td>
              <Code>--type-micro-bold</Code> (see <a href="#/foundations/typography">Typography</a>)
            </td>
          </tr>
          <tr>
            <td>Spacing</td>
            <td>
              <Code>--space-{'{px}'}</Code>
            </td>
            <td>
              <Code>--space-16</Code>
            </td>
          </tr>
          <tr>
            <td>Radius</td>
            <td>
              <Code>--radius-{'{size}'}</Code>
            </td>
            <td>
              <Code>--radius-md</Code>
            </td>
          </tr>
          <tr>
            <td>Elevation</td>
            <td>
              <Code>--shadow-{'{surface}'}</Code>
            </td>
            <td>
              <Code>--shadow-card</Code>
            </td>
          </tr>
        </Table>
      </Section>

      <Section title="Usage">
        <Prose>
          <p>
            <Code>tokens.css</Code> is imported once, in <Code>main.tsx</Code>. Components read tokens with{' '}
            <Code>var()</Code> in their CSS Module. They don’t hard-code values, and they don’t style each other’s
            internals.
          </p>
        </Prose>
        <CodeBlock code={usageExample} label="Component.module.css" />
      </Section>

      <Section title="Colour">
        <Prose>
          <p>
            Semantic colour tokens say <em>what a colour is for</em>. Pick the token for the role, not the hex. The raw
            values are on <a href="#/foundations/colours">Colours</a>.
          </p>
        </Prose>
        {COLOUR_GROUPS.map((group) => (
          <div key={group.prefix}>
            <SubHeading>
              {group.title} <span className={styles.subtle}>· Figma {group.figma}</span>
            </SubHeading>
            <Table head={['', 'Token', 'Value', 'Figma / note', 'Used in']}>
              {tokensWithPrefix(group.prefix).map((token) => (
                <tr key={token.name}>
                  <td>
                    <span className={styles.chip} style={{ background: `var(${token.name})` }} />
                  </td>
                  <td>
                    <Code>{token.name}</Code>
                  </td>
                  <td>
                    <Code>{resolveValue(token.value)}</Code>
                  </td>
                  <td>
                    <Note token={token} />
                  </td>
                  <td>
                    <UsedIn names={token.usedIn} />
                  </td>
                </tr>
              ))}
            </Table>
          </div>
        ))}
      </Section>

      <Section title="Spacing">
        <Prose>
          <p>
            Spacing tokens are the auto-layout gaps and padding used in Figma, named by their pixel value. There is no
            abstract scale yet: only the values the design uses exist.
          </p>
        </Prose>
        <Table head={['Token', 'Value', 'Scale', 'Used in']}>
          {spacing.map((token) => (
            <tr key={token.name}>
              <td>
                <Code>{token.name}</Code>
              </td>
              <td>{token.value}</td>
              <td>
                <span className={styles.spaceBar} style={{ width: `var(${token.name})` }} />
              </td>
              <td>
                <UsedIn names={token.usedIn} />
              </td>
            </tr>
          ))}
        </Table>
      </Section>

      <Section title="Radius">
        <Prose>
          <p>
            Nested corners stay concentric: the card’s 24px radius minus its 8px padding gives the photo’s 16px.
          </p>
        </Prose>
        <div className={styles.tileGrid}>
          {radii.map((token) => (
            <figure key={token.name} className={styles.tile}>
              <div className={styles.radiusSample} style={{ borderRadius: `var(${token.name})` }} />
              <figcaption className={styles.tileCaption}>
                <Code>{token.name}</Code>
                <span className={styles.tileValue}>{token.value}</span>
                {token.note && <span className={styles.note}>{token.note}</span>}
                <UsedIn names={token.usedIn} />
              </figcaption>
            </figure>
          ))}
        </div>
      </Section>

      <Section title="Elevation">
        <Prose>
          <p>
            Shadows are layered and tinted with the ink colour, never pure black. The button shadows are insets that
            give a pressed-in bottom edge; they drop to <Code>none</Code> while pressed.
          </p>
        </Prose>
        <div className={styles.tileGrid}>
          {shadows.map((token) => (
            <figure key={token.name} className={styles.tile}>
              <div className={styles.shadowStage}>
                {/* Inset shadows belong to a button, so preview them on that button's fill. */}
                <div
                  className={styles.shadowSample}
                  data-inset={token.value.startsWith('inset') || undefined}
                  style={{
                    boxShadow: `var(${token.name})`,
                    background: token.value.startsWith('inset')
                      ? `var(${token.name.includes('cta-volunteer') ? '--color-cta-volunteer' : '--color-button-primary'})`
                      : undefined,
                  }}
                />
              </div>
              <figcaption className={styles.tileCaption}>
                <Code>{token.name}</Code>
                {token.note && <span className={styles.note}>{token.note}</span>}
                <UsedIn names={token.usedIn} />
              </figcaption>
            </figure>
          ))}
        </div>
      </Section>

      <Section title="Motion">
        <Callout>
          <p>
            Motion tokens (<Code>--learn-*</Code>, <Code>--reveal-*</Code>, <Code>--digit-*</Code> and others) are
            also in <Code>tokens.css</Code>. They come from transitions.dev recipes, not Figma, and are documented
            in the README’s Motion section.
          </p>
        </Callout>
      </Section>
    </>
  );
}
