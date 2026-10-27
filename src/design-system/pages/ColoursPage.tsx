import type { CSSProperties } from 'react';
import { Callout, Code, Prose, Section, Table, PageTitle, UsedIn } from '../components/Doc/Doc';
import { colourFamily, contrastRating, contrastRatio, hexToRgb, rgbToHex, rgbToHsl, type Rgb } from '../lib/colour';
import { findTranslucentColours, getToken, resolveValue, tokensWithPrefix } from '../lib/tokens';
import styles from './Foundations.module.css';

type BaseColour = { hex: string; rgb: Rgb; tokens: string[] };

/** Every distinct solid colour in tokens.css, with the tokens that point at it. */
function collectBaseColours() {
  const byHex = new Map<string, BaseColour>();
  for (const token of tokensWithPrefix('--color-')) {
    const rgb = hexToRgb(resolveValue(token.value));
    if (!rgb) continue;
    const hex = rgbToHex(rgb);
    const entry = byHex.get(hex) ?? { hex, rgb, tokens: [] };
    entry.tokens.push(token.name);
    byHex.set(hex, entry);
  }
  return [...byHex.values()];
}

const FAMILY_ORDER = ['Neutral', 'Blue', 'Purple', 'Orange', 'Red', 'Yellow', 'Green'];

const FAMILY_ROLE: Record<string, string> = {
  Neutral: 'Text, icons, surfaces and the disabled state. The darkest neutral is the ink colour; it also tints every shadow.',
  Blue: 'The primary action colour (Buttons/primary) and its pressed state.',
  Purple: 'The cause card’s volunteer CTA, added in Figma V2. Its pressed shade is derived in code; it isn’t a Figma variable yet.',
  Orange: 'The secondary accent (Background/secondary), used for progress.',
};

const WHITE = { r: 255, g: 255, b: 255 };
const INK = hexToRgb(resolveValue(getToken('--color-text-default')?.value ?? '#000')) ?? { r: 0, g: 0, b: 0 };

function ContrastBadge({ against, label, rgb }: { against: Rgb; label: string; rgb: Rgb }) {
  const ratio = contrastRatio(rgb, against);
  const rating = contrastRating(ratio);
  return (
    <span className={styles.contrast}>
      <span className={styles.contrastDot} style={{ background: rgbToHex(against) }} aria-hidden="true" />
      <span className={styles.visuallyHidden}>{label}</span>
      {ratio.toFixed(1)}:1
      <span className={styles.rating} data-rating={rating}>
        {rating}
      </span>
    </span>
  );
}

function Swatch({ colour }: { colour: BaseColour }) {
  const { r, g, b } = colour.rgb;
  return (
    <figure className={styles.swatch}>
      <div className={styles.swatchColour} style={{ background: colour.hex }} />
      <figcaption className={styles.swatchBody}>
        <span className={styles.swatchHex}>{colour.hex}</span>
        <span className={styles.swatchMeta}>
          rgb({r} {g} {b})
        </span>
        <span className={styles.swatchTokens}>
          {colour.tokens.map((name) => (
            <Code key={name}>{name}</Code>
          ))}
        </span>
        <span className={styles.swatchContrast}>
          <ContrastBadge rgb={colour.rgb} against={WHITE} label="Contrast with white:" />
          <ContrastBadge rgb={colour.rgb} against={INK} label="Contrast with ink:" />
        </span>
      </figcaption>
    </figure>
  );
}

/** Text-on-surface pairs the components actually render. */
const PAIRS: { text: string; surface: string; where: string }[] = [
  { text: '--color-text-default', surface: '--color-bg-canvas', where: 'Card title, body text' },
  { text: '--color-text-neutral', surface: '--color-bg-canvas', where: 'Org byline' },
  { text: '--color-text-neutral', surface: '--color-bg-on-canvas', where: 'Stat label (CAPS)' },
  { text: '--color-text-default', surface: '--color-bg-on-canvas', where: 'Stat value' },
  { text: '--color-text-on-solid-bg', surface: '--color-button-primary', where: 'Primary button label' },
  { text: '--color-text-on-solid-bg', surface: '--color-cta-volunteer', where: 'Volunteer CTA label' },
  { text: '--color-text-disabled', surface: '--color-button-disabled', where: 'Disabled button label' },
];

export function ColoursPage() {
  const base = collectBaseColours();
  const families = FAMILY_ORDER.map((family) => ({
    family,
    colours: base
      .filter((colour) => colourFamily(colour.rgb) === family)
      // Light to dark, like a tonal scale.
      .sort((a, b) => rgbToHsl(b.rgb).l - rgbToHsl(a.rgb).l),
  })).filter((group) => group.colours.length > 0);
  const translucent = findTranslucentColours();

  return (
    <>
      <PageTitle title="Colours">
        The base palette: every distinct colour the product uses, grouped by hue. Components never use these values
        directly. They use the semantic <a href="#/foundations/tokens">Design Tokens</a> that point at them.
      </PageTitle>

      <Callout>
        <p>
          Generated from <Code>src/styles/tokens.css</Code>. Add or change a colour there and this page updates.
          Contrast ratios are WCAG 2.2, rated for normal-size text.
        </p>
      </Callout>

      {families.map(({ family, colours }) => (
        <Section key={family} title={family}>
          {FAMILY_ROLE[family] && (
            <Prose>
              <p>{FAMILY_ROLE[family]}</p>
            </Prose>
          )}
          <div className={styles.swatchGrid}>
            {colours.map((colour) => (
              <Swatch key={colour.hex} colour={colour} />
            ))}
          </div>
        </Section>
      ))}

      <Section title="Transparent">
        <Prose>
          <p>
            Translucent colours are a base colour at reduced opacity. They aren’t tokens on their own: they live
            inside shadow tokens, or (for the pill) in the component, because Figma applies them as raw fills.
          </p>
        </Prose>
        <Table head={['Swatch', 'Colour', 'Opacity', 'Used in']}>
          {translucent.map((colour) => {
            const hex = rgbToHex(colour);
            return (
              <tr key={`${hex}-${colour.alpha}`}>
                <td>
                  <span
                    className={styles.checker}
                    style={{ '--swatch': `rgb(${colour.r} ${colour.g} ${colour.b} / ${colour.alpha})` } as CSSProperties}
                  />
                </td>
                <td>
                  <Code>{hex}</Code>
                </td>
                <td>{Math.round(colour.alpha * 100)}%</td>
                <td>
                  <UsedIn names={colour.usedIn} />
                </td>
              </tr>
            );
          })}
        </Table>
      </Section>

      <Section title="Contrast">
        <Prose>
          <p>
            Text needs <strong>4.5:1</strong> against its background (AA), or <strong>3:1</strong> for large text
            (18.66px bold / 24px regular and up). These are the pairs the components render today:
          </p>
        </Prose>
        <Table head={['Sample', 'Text', 'Surface', 'Ratio', 'Where']}>
          {PAIRS.map(({ text, surface, where }) => {
            const fg = hexToRgb(resolveValue(getToken(text)?.value ?? ''));
            const bg = hexToRgb(resolveValue(getToken(surface)?.value ?? ''));
            if (!fg || !bg) return null;
            const ratio = contrastRatio(fg, bg);
            const rating = contrastRating(ratio);
            return (
              <tr key={`${text}-${surface}`}>
                <td>
                  <span className={styles.pairSample} style={{ color: `var(${text})`, background: `var(${surface})` }}>
                    Aa
                  </span>
                </td>
                <td>
                  <Code>{text}</Code>
                </td>
                <td>
                  <Code>{surface}</Code>
                </td>
                <td className={styles.ratioCell}>
                  {ratio.toFixed(2)}:1{' '}
                  <span className={styles.rating} data-rating={rating}>
                    {rating}
                  </span>
                </td>
                <td>{where}</td>
              </tr>
            );
          })}
        </Table>
        <Callout tone="warning" icon="⚠️">
          <p>
            White on <Code>--color-button-primary</Code> is below 4.5:1. It’s the Figma value, so it’s kept as
            designed. Raise it with design before reusing the blue button for body-size labels. Disabled text is
            exempt from WCAG contrast requirements.
          </p>
        </Callout>
      </Section>
    </>
  );
}
