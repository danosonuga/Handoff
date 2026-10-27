import tokensCss from '@/styles/tokens.css?raw';

/**
 * The docs read tokens straight from src/styles/tokens.css (and find where
 * each one is used by scanning the component CSS), so the design system
 * pages can never drift from the code. Edit tokens.css, not this file.
 */

export type Token = {
  /** CSS custom property, e.g. `--color-text-default`. */
  name: string;
  /** Value as written in tokens.css, whitespace collapsed. */
  value: string;
  /** The Figma variable or note from the token's comment. */
  note?: string;
  /** Components (or global files) whose CSS reads this token. */
  usedIn: string[];
};

/** Every stylesheet that may read a token, keyed by file path. */
const consumerCss = import.meta.glob<string>(
  ['/src/components/**/*.module.css', '/src/styles/global.css', '/src/App.module.css'],
  { query: '?raw', import: 'default', eager: true },
);

/** `/src/components/Button/Button.module.css` → `Button`; `/src/styles/global.css` → `global.css`. */
function consumerName(path: string) {
  const component = path.match(/\/components\/([^/]+)\//);
  return component ? component[1] : path.split('/').pop()!;
}

function findUsages(name: string) {
  const reference = new RegExp(`var\\(\\s*${name}\\s*[,)]`);
  return Object.entries(consumerCss)
    .filter(([, css]) => reference.test(css))
    .map(([path]) => consumerName(path))
    .sort();
}

// `--name: value;` with an optional `/* comment */` on the same line.
const DECLARATION = /(--[\w-]+)\s*:\s*([^;]+);[ \t]*(?:\/\*\s*(.*?)\s*\*\/)?/g;
// A comment that ends right before the declaration (only whitespace after it).
const LEADING_COMMENT = /\/\*\s*([\s\S]*?)\s*\*\/\s*$/;

function parseTokens(css: string): Token[] {
  const tokens: Token[] = [];
  let previousEnd = 0;
  for (const match of css.matchAll(DECLARATION)) {
    const [, name, rawValue, trailing] = match;
    // Without a trailing comment, fall back to a note on the line above — but
    // only a sentence-like one ("Derived: …"), not a section header ("Radii").
    let note = trailing;
    if (!note) {
      const leading = css.slice(previousEnd, match.index).match(LEADING_COMMENT)?.[1];
      if (leading && /[.:]/.test(leading)) note = leading.replace(/^[^—\n]+—\s*/, '').replace(/\s+/g, ' ');
    }
    tokens.push({
      name,
      value: rawValue.replace(/\s+/g, ' ').trim(),
      note,
      usedIn: findUsages(name),
    });
    previousEnd = match.index + match[0].length;
  }
  return tokens;
}

export const tokens = parseTokens(tokensCss);

export const tokensWithPrefix = (prefix: string) => tokens.filter((token) => token.name.startsWith(prefix));

export const getToken = (name: string) => tokens.find((token) => token.name === name);

/** Follows `var(--x)` references until a literal value is reached. */
export function resolveValue(value: string): string {
  const reference = value.match(/^var\((--[\w-]+)\)$/);
  const target = reference && getToken(reference[1]);
  return target ? resolveValue(target.value) : value;
}

/** Translucent colours (`rgb(r g b / a)`) used anywhere in tokens or component CSS. */
export function findTranslucentColours() {
  const sources: Record<string, string> = { 'tokens.css': tokensCss };
  for (const [path, css] of Object.entries(consumerCss)) sources[consumerName(path)] = css;

  const found = new Map<string, { r: number; g: number; b: number; alpha: number; usedIn: Set<string> }>();
  for (const [source, css] of Object.entries(sources)) {
    for (const [, r, g, b, alpha] of css.matchAll(/rgb\((\d+) (\d+) (\d+) \/ ([\d.]+)\)/g)) {
      const key = `${r} ${g} ${b} / ${alpha}`;
      const entry = found.get(key) ?? { r: +r, g: +g, b: +b, alpha: +alpha, usedIn: new Set<string>() };
      // Name the token that declares it when it comes from tokens.css.
      if (source === 'tokens.css') {
        for (const token of tokens) if (token.value.includes(`rgb(${key})`)) entry.usedIn.add(token.name);
      } else {
        entry.usedIn.add(source);
      }
      found.set(key, entry);
    }
  }
  return [...found.values()].map((entry) => ({ ...entry, usedIn: [...entry.usedIn] }));
}

/**
 * The tracking token for a text style: its own (`--type-h2-bold-tracking`),
 * else its group's (`--type-h2-tracking`). Undefined means 0.
 */
export function trackingFor(name: string) {
  const group = name.match(/^(--type-[\w-]+?)-(?:bold|medium|regular)$/)?.[1];
  return getToken(`${name}-tracking`) ?? (group ? getToken(`${group}-tracking`) : undefined);
}

/** Splits a `font` shorthand token such as `590 14px / 22px var(--font-family-base)`. */
export function parseFontShorthand(value: string) {
  const match = value.match(/^(\d+)\s+([\d.]+px)\s*\/\s*([\d.]+px)/);
  return match ? { weight: Number(match[1]), size: match[2], lineHeight: match[3] } : undefined;
}
