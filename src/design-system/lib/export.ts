import { hexToRgb } from './colour';
import { parseFontShorthand, resolveValue, tokens, trackingFor, type Token } from './tokens';

/**
 * Token exports for the docs: CSS custom properties, and JSON in the W3C
 * Design Tokens Format Module 2025.10 (designtokens.org). Both are built from
 * the same parsed tokens.css, so an export always matches the code.
 * Motion tokens are left out: they're transitions.dev recipe defaults, and
 * that licence doesn't allow republishing the collection.
 */

export type Category = 'colour' | 'typography' | 'spacing' | 'radius' | 'shadow';

const PREFIXES: Record<Category, string[]> = {
  colour: ['--color-'],
  typography: ['--font-family-', '--type-'],
  spacing: ['--space-'],
  radius: ['--radius-'],
  shadow: ['--shadow-'],
};

const TITLES: Record<Category, string> = {
  colour: 'Colour',
  typography: 'Typography',
  spacing: 'Spacing',
  radius: 'Radius',
  shadow: 'Elevation',
};

export const ALL_CATEGORIES: Category[] = ['colour', 'typography', 'spacing', 'radius', 'shadow'];

/** Clash Display isn't redistributable, so exports link Fontshare's stylesheet. */
export const DISPLAY_FONT_CSS = 'https://api.fontshare.com/v2/css?f[]=clash-display@400,500,600&display=swap';

const tokensIn = (category: Category) =>
  tokens.filter((token) => PREFIXES[category].some((prefix) => token.name.startsWith(prefix)));

/* ---------- CSS ---------- */

export function toCss(categories: Category[]) {
  const lines = ['/* Handoff Design System tokens, generated from src/styles/tokens.css */'];
  if (categories.includes('typography')) lines.unshift(`@import url('${DISPLAY_FONT_CSS}');`, '');
  lines.push(':root {');
  for (const category of categories) {
    lines.push(`  /* ${TITLES[category]} */`);
    for (const token of tokensIn(category)) {
      lines.push(`  ${token.name}: ${token.value};${token.note ? ` /* ${token.note} */` : ''}`);
    }
    lines.push('');
  }
  if (lines.at(-1) === '') lines.pop();
  lines.push('}', '');
  return lines.join('\n');
}

/** CSS for one text style, as tokens (for this codebase) or raw values (anywhere). */
export function styleCss(token: Token, mode: 'tokens' | 'values') {
  const tracking = trackingFor(token.name);
  const caps = token.name === '--type-caps';
  const font =
    mode === 'tokens'
      ? `var(${token.name})`
      : token.value.replace(/var\((--[\w-]+)\)/g, (_, name: string) => resolveValue(`var(${name})`));
  return [
    `font: ${font};`,
    tracking && `letter-spacing: ${mode === 'tokens' ? `var(${tracking.name})` : tracking.value};`,
    caps && 'text-transform: uppercase;',
  ]
    .filter(Boolean)
    .join('\n');
}

/* ---------- Design Tokens JSON (DTCG 2025.10) ---------- */

type Json = { [key: string]: unknown };

const round = (n: number, places = 4) => Number(n.toFixed(places));

function dimension(value: string) {
  const match = value.trim().match(/^(-?[\d.]+)(px|rem)?$/);
  return match ? { value: Number(match[1]), unit: match[2] ?? 'px' } : undefined;
}

function colour(value: string) {
  const hex = hexToRgb(value);
  if (hex) {
    return {
      colorSpace: 'srgb',
      components: [hex.r, hex.g, hex.b].map((c) => round(c / 255)),
      hex: value.toLowerCase(),
    };
  }
  const rgba = value.match(/^rgb\((\d+) (\d+) (\d+)(?: \/ ([\d.]+))?\)$/);
  if (!rgba) return undefined;
  return {
    colorSpace: 'srgb',
    components: [rgba[1], rgba[2], rgba[3]].map((c) => round(Number(c) / 255)),
    alpha: rgba[4] === undefined ? 1 : Number(rgba[4]),
  };
}

/** Splits on commas that aren't inside parentheses. */
function splitTopLevel(value: string) {
  const parts: string[] = [];
  let depth = 0;
  let current = '';
  for (const char of value) {
    if (char === '(') depth++;
    if (char === ')') depth--;
    if (char === ',' && depth === 0) {
      parts.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  parts.push(current.trim());
  return parts;
}

function shadow(value: string) {
  const layers = splitTopLevel(value).map((layer) => {
    const inset = layer.startsWith('inset');
    const colourText = layer.match(/rgb\([^)]*\)|#[0-9a-f]{3,6}/i)?.[0] ?? '';
    const lengths = layer.replace('inset', '').replace(colourText, '').trim().split(/\s+/).map(dimension);
    const [offsetX, offsetY, blur, spread] = lengths;
    return { color: colour(colourText), offsetX, offsetY, blur, spread: spread ?? { value: 0, unit: 'px' }, inset };
  });
  return layers.length === 1 ? layers[0] : layers;
}

/** Path inside the JSON for a token, e.g. --color-bg-on-canvas → ["color", "bg", "on-canvas"]. */
function pathFor(token: Token, category: Category): string[] {
  const name = token.name.slice(2);
  if (category === 'colour') {
    const [, group, ...rest] = name.split('-');
    return ['color', group, rest.join('-')];
  }
  if (category === 'typography') {
    if (name.startsWith('font-family-')) return ['font', 'family', name.replace('font-family-', '')];
    const style = name.replace('type-', '');
    const variant = style.match(/^(.+)-(bold|medium|regular|large|small)$/);
    return variant ? ['typography', variant[1], variant[2]] : ['typography', style];
  }
  const [group, ...rest] = name.split('-');
  return [group, rest.join('-')];
}

function setPath(target: Json, path: string[], value: Json) {
  let node = target;
  for (const key of path.slice(0, -1)) node = (node[key] ??= {}) as Json;
  node[path.at(-1)!] = value;
}

function fontFamilyList(value: string) {
  return value.split(',').map((family) => family.trim().replace(/^'|'$/g, ''));
}

function typography(token: Token): Json | undefined {
  const font = parseFontShorthand(token.value);
  if (!font) return undefined;
  const family = token.value.match(/var\(--font-family-([\w-]+)\)/)?.[1];
  const size = parseFloat(font.size);
  const tracking = trackingFor(token.name);
  return {
    fontFamily: family ? `{font.family.${family}}` : 'inherit',
    fontSize: { value: size, unit: 'px' },
    fontWeight: font.weight,
    letterSpacing: dimension(tracking?.value ?? '0px'),
    // DTCG line height is a multiplier of the font size; the px value is in $extensions.
    lineHeight: round(parseFloat(font.lineHeight) / size),
  };
}

function toDtcgToken(token: Token, category: Category): Json | undefined {
  const description = token.note ? { $description: token.note } : {};
  switch (category) {
    case 'colour': {
      const value = colour(resolveValue(token.value));
      return value && { $type: 'color', $value: value, ...description };
    }
    case 'spacing':
    case 'radius': {
      const value = dimension(token.value);
      return value && { $type: 'dimension', $value: value, ...description };
    }
    case 'shadow':
      return { $type: 'shadow', $value: shadow(token.value), ...description };
    case 'typography': {
      if (token.name.startsWith('--font-family-')) {
        return { $type: 'fontFamily', $value: fontFamilyList(token.value), ...description };
      }
      const value = typography(token);
      return (
        value && {
          $type: 'typography',
          $value: value,
          ...description,
          $extensions: { 'com.handoff.css': { token: token.name, lineHeight: parseFontShorthand(token.value)!.lineHeight } },
        }
      );
    }
  }
}

export function toDesignTokensJson(categories: Category[]) {
  const root: Json = {
    $description: 'Handoff Design System tokens, generated from src/styles/tokens.css (W3C Design Tokens Format 2025.10).',
  };
  for (const category of categories) {
    for (const token of tokensIn(category)) {
      // Tracking is folded into each typography token's letterSpacing.
      if (token.name.endsWith('-tracking')) continue;
      const dtcg = toDtcgToken(token, category);
      if (dtcg) setPath(root, pathFor(token, category), dtcg);
    }
  }
  return `${JSON.stringify(root, null, 2)}\n`;
}

/* ---------- Browser helpers ---------- */

export function download(fileName: string, contents: string, type: string) {
  const url = URL.createObjectURL(new Blob([contents], { type }));
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  // Revoke after the click has started the download (immediate revoke cancels it in some browsers).
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
