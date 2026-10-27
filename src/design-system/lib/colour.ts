export type Rgb = { r: number; g: number; b: number };

export function hexToRgb(hex: string): Rgb | undefined {
  const match = hex.trim().match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!match) return undefined;
  const digits = match[1].length === 3 ? [...match[1]].map((d) => d + d).join('') : match[1];
  const n = parseInt(digits, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

export const rgbToHex = ({ r, g, b }: Rgb) => `#${[r, g, b].map((c) => c.toString(16).padStart(2, '0')).join('')}`;

/** WCAG 2 relative luminance. */
function luminance({ r, g, b }: Rgb) {
  const [R, G, B] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

/** WCAG 2 contrast ratio, 1–21. */
export function contrastRatio(a: Rgb, b: Rgb) {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
}

/** WCAG 2.2 rating for normal-size text. */
export function contrastRating(ratio: number) {
  if (ratio >= 7) return 'AAA';
  if (ratio >= 4.5) return 'AA';
  if (ratio >= 3) return 'AA Large';
  return 'Fail';
}

export function rgbToHsl({ r, g, b }: Rgb) {
  const [R, G, B] = [r / 255, g / 255, b / 255];
  const max = Math.max(R, G, B);
  const min = Math.min(R, G, B);
  const l = (max + min) / 2;
  const d = max - min;
  if (d === 0) return { h: 0, s: 0, l };
  const s = d / (1 - Math.abs(2 * l - 1));
  const h =
    max === R ? ((G - B) / d + (G < B ? 6 : 0)) * 60 : max === G ? ((B - R) / d + 2) * 60 : ((R - G) / d + 4) * 60;
  return { h, s, l };
}

/** Groups a colour into a hue family, so new palette values sort themselves. */
export function colourFamily(rgb: Rgb) {
  const { h, s } = rgbToHsl(rgb);
  if (s < 0.2) return 'Neutral';
  if (h < 15 || h >= 330) return 'Red';
  if (h < 45) return 'Orange';
  if (h < 70) return 'Yellow';
  if (h < 170) return 'Green';
  if (h < 235) return 'Blue';
  return 'Purple';
}
