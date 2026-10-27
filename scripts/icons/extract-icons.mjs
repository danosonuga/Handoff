#!/usr/bin/env node
/**
 * Cuts the Figma "Iconography" section (78:1625) into one SVG per icon.
 *
 * Input:  a folder of SVG exports, one per category frame, named by node id
 *         (`78-3338.svg` for frame 78:3338), exported from Figma as SVG.
 * Output: src/assets/icons/{category}/{name}.svg and src/assets/icons/icons.json.
 *
 * Each icon is the `<g id="{Figma name}">` group in its frame's export. The
 * group's paths use the export's absolute coordinates, so they're moved back to
 * 0,0 using the icon's position from figma-manifest.json (Figma metadata). The
 * icon colour (#565B5F, Icon/neutral) becomes currentColor; ids and clip-paths
 * (each icon's own 24×24 box) are dropped.
 *
 * Usage: node scripts/icons/extract-icons.mjs <exports-folder>
 */
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const exportsDir = process.argv[2];
if (!exportsDir) {
  console.error('Usage: node scripts/icons/extract-icons.mjs <exports-folder>');
  process.exit(1);
}

const manifest = JSON.parse(readFileSync(join(root, 'scripts/icons/figma-manifest.json'), 'utf8'));
const outDir = join(root, 'src/assets/icons');
const ICON_COLOUR = /#565B5F/gi;
const SIZE = 24;

/** Figma writes non-ASCII and `&` in ids as numeric entities of their UTF-8 bytes (Ω → &#206;&#169;). */
const figmaId = (text) =>
  [...Buffer.from(text, 'utf8')]
    .map((byte) => (byte > 127 || byte === 38 ? `&#${byte};` : String.fromCharCode(byte)))
    .join('')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/** File-safe icon name: "Ωomega-line" → "omega-line", "&and-line" → "and-line". */
const fileName = (name) => name.normalize('NFKD').replace(/[^a-z0-9-]/gi, '').toLowerCase();

/** Bounding box of absolute path coordinates (control points included, so it's slightly generous). */
function bbox(body) {
  const xs = [];
  const ys = [];
  for (const [, d] of body.matchAll(/ d="([^"]*)"/g)) {
    for (const [, cmd, args] of d.matchAll(/([MLCQSTHVAZ])([^MLCQSTHVAZ]*)/gi)) {
      const n = (args.match(/-?\d*\.?\d+(?:e-?\d+)?/g) ?? []).map(Number);
      if (/[MLCQST]/.test(cmd)) for (let i = 0; i + 1 < n.length; i += 2) (xs.push(n[i]), ys.push(n[i + 1]));
      else if (cmd === 'H') xs.push(...n);
      else if (cmd === 'V') ys.push(...n);
      else if (cmd === 'A') for (let i = 0; i + 6 < n.length; i += 7) (xs.push(n[i + 5]), ys.push(n[i + 6]));
    }
  }
  for (const [, cx, cy] of body.matchAll(/cx="([\d.]+)" cy="([\d.]+)"/g)) (xs.push(Number(cx)), ys.push(Number(cy)));
  return { x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) };
}

const fits = (box, x, y) => box.x0 - x >= -0.5 && box.x1 - x <= SIZE + 0.5 && box.y0 - y >= -0.5 && box.y1 - y <= SIZE + 0.5;

/** The full `<g …>…</g>` element starting at `start`, balancing nested groups. */
function groupAt(svg, start) {
  const tags = /<g\b[^>]*?(\/?)>|<\/g>/g;
  tags.lastIndex = start;
  let depth = 0;
  for (let match; (match = tags.exec(svg)); ) {
    if (match[0] === '</g>') depth--;
    else if (!match[1]) depth++;
    if (depth === 0) return svg.slice(start, tags.lastIndex);
  }
  throw new Error(`Unbalanced <g> at ${start}`);
}

/** The frame's offset inside its export (exports pad the frame for its shadow). */
function frameOffset(svg) {
  const match = svg.match(/<g id="[^"]*" filter="url\(#[^)]*\)">\s*<rect x="([\d.]+)" y="([\d.]+)"/);
  if (!match) throw new Error('Frame rect not found');
  return { x: Number(match[1]), y: Number(match[2]) };
}

function cleanIcon(group) {
  const inner = group.replace(/^<g\b[^>]*>/, '').replace(/<\/g>$/, '');
  return inner
    .replace(/\s(id|clip-path|filter|data-[\w-]+)="[^"]*"/g, '')
    .replace(ICON_COLOUR, 'currentColor')
    .replace(/\n\s*\n/g, '\n')
    .trim();
}

rmSync(outDir, { recursive: true, force: true });
const written = [];
const problems = [];
const shifted = [];
const seen = new Set();

for (const frame of manifest.frames) {
  const svg = readFileSync(join(exportsDir, `${frame.nodeId.replace(':', '-')}.svg`), 'utf8');
  const offset = frameOffset(svg);
  for (const icon of manifest.icons.filter((i) => i.frameId === frame.nodeId)) {
    const name = fileName(icon.name);
    if (seen.has(name)) {
      problems.push(`duplicate name skipped: ${icon.figmaName} (${icon.nodeId})`);
      continue;
    }
    const start = svg.indexOf(`<g id="${figmaId(icon.figmaName)}"`);
    if (start < 0) {
      problems.push(`not in export: ${icon.figmaName} (${icon.nodeId})`);
      continue;
    }
    const body = cleanIcon(groupAt(svg, start));
    const otherColours = body.match(/#[0-9a-f]{3,6}\b/gi);
    if (otherColours) problems.push(`extra colours in ${icon.figmaName}: ${[...new Set(otherColours)].join(', ')}`);

    // Some components' vectors sit one icon-width (24px) away from the component's
    // own position in Figma. When the artwork is outside the box, try the 24px
    // neighbours and keep the one it fits.
    let x = offset.x + icon.x;
    let y = offset.y + icon.y;
    const box = bbox(body);
    if (!fits(box, x, y)) {
      const shifts = [[-SIZE, 0], [SIZE, 0], [0, -SIZE], [0, SIZE]];
      const fix = shifts.find(([dx, dy]) => fits(box, x + dx, y + dy));
      if (fix) {
        x += fix[0];
        y += fix[1];
        shifted.push(`${icon.figmaName} (${fix[0] || fix[1]}px ${fix[0] ? 'x' : 'y'})`);
      } else {
        problems.push(`artwork outside its box: ${icon.figmaName} (${icon.nodeId})`);
      }
    }
    const file = `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}" fill="none">\n<g transform="translate(${-x} ${-y})">\n${body}\n</g>\n</svg>\n`;
    const path = join(outDir, icon.category, `${name}.svg`);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, file);
    seen.add(name);

    // A few icons use "regular" / "filled" instead of "line" / "fill" (e.g. add_regular).
    const style = /-(line|regular)$/.test(name) ? 'line' : /-(fill|filled)$/.test(name) ? 'fill' : 'other';
    written.push({
      name,
      base: name.replace(/-(line|fill|regular|filled)$/, ''),
      style,
      category: icon.category,
      figmaName: icon.figmaName,
      nodeId: icon.nodeId,
    });
  }
}

writeFileSync(
  join(outDir, 'icons.json'),
  `${JSON.stringify({ source: manifest.source, count: written.length, icons: written }, null, 1)}\n`,
);
console.log(`Wrote ${written.length} icons to src/assets/icons/`);
if (shifted.length) console.log(`${shifted.length} re-aligned (artwork offset from its component in Figma):\n  ${shifted.join('\n  ')}`);
if (problems.length) console.log(`${problems.length} notes:\n  ${problems.join('\n  ')}`);
