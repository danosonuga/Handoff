import { useEffect, useMemo, useRef, useState } from 'react';
import iconData from '@/assets/icons/icons.json';
import { Icon } from '@/components/Icon/Icon';
import { CopyTooltip } from '../components/CopyTooltip/CopyTooltip';
import { Callout, Code, DoDont, PageTitle, Prose, PropsTable, Section, Table } from '../components/Doc/Doc';
import { Example } from '../components/Example/Example';
import { ExportAction, ExportBar } from '../components/ExportBar/ExportBar';
import { SegmentedControl } from '../components/SegmentedControl/SegmentedControl';
import IconColour from '../examples/icons/IconColour';
import iconColourCss from '../examples/icons/IconColour.module.css?raw';
import iconColourCode from '../examples/icons/IconColour.tsx?raw';
import IconLineFill from '../examples/icons/IconLineFill';
import iconLineFillCss from '../examples/icons/IconLineFill.module.css?raw';
import iconLineFillCode from '../examples/icons/IconLineFill.tsx?raw';
import IconSizes from '../examples/icons/IconSizes';
import iconSizesCode from '../examples/icons/IconSizes.tsx?raw';
import { download } from '../lib/export';
import styles from './IconsPage.module.css';

type IconEntry = (typeof iconData.icons)[number];
type StyleFilter = 'line' | 'fill' | 'all';

/** Every icon's URL. `no-inline` keeps them as files, loaded only when shown. */
const urls = import.meta.glob<string>('/src/assets/icons/**/*.svg', {
  query: '?url&no-inline',
  import: 'default',
  eager: true,
});
const urlFor = (icon: IconEntry) => urls[`/src/assets/icons/${icon.category}/${icon.name}.svg`];

const CATEGORIES = [...new Set(iconData.icons.map((icon) => icon.category))].sort();
const SIZES = [16, 20, 24] as const;

/** "cake-line" → "cakeLine"; a leading digit gets an "icon" prefix to stay a valid identifier. */
function variableName(name: string) {
  const camel = name.replace(/-([a-z0-9])/g, (_, c: string) => c.toUpperCase());
  return /^\d/.test(camel) ? `icon${camel[0].toUpperCase()}${camel.slice(1)}` : camel;
}

function snippet(icon: IconEntry, size: number) {
  const name = variableName(icon.name);
  return `import ${name} from '@/assets/icons/${icon.category}/${icon.name}.svg';\n\n<Icon src={${name}}${size === 16 ? '' : ` size={${size}}`} />`;
}

/** Renders its icons only once scrolled near, so the page doesn't load ~1,200 SVGs up front. */
function CategoryGrid({ category, icons, size }: { category: string; icons: IconEntry[]; size: number }) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || visible) return;
    const observer = new IntersectionObserver(([entry]) => entry.isIntersecting && setVisible(true), {
      rootMargin: '600px 0px',
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [visible]);

  return (
    <section ref={ref} className={styles.category} aria-label={`${category} icons`}>
      <h3 className={styles.categoryTitle}>
        {category} <span className={styles.categoryCount}>{icons.length}</span>
      </h3>
      <ul className={styles.grid}>
        {icons.map((icon) => (
          <li key={icon.name} className={styles.cell}>
            <CopyTooltip text={snippet(icon, size)} label={`Copy ${icon.name}`} className={styles.copy}>
              <span className={styles.tile}>
                <span className={styles.glyph}>{visible && <Icon src={urlFor(icon)} size={size} />}</span>
                <span className={styles.name}>{icon.name}</span>
              </span>
            </CopyTooltip>
          </li>
        ))}
      </ul>
    </section>
  );
}

async function downloadSprite() {
  const symbols = await Promise.all(
    iconData.icons.map(async (icon) => {
      const svg = await (await fetch(urlFor(icon))).text();
      const inner = svg.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
      return `<symbol id="${icon.name}" viewBox="0 0 24 24" fill="none">${inner.trim()}</symbol>`;
    }),
  );
  const sprite = `<svg xmlns="http://www.w3.org/2000/svg" style="display:none">\n${symbols.join('\n')}\n</svg>\n`;
  download('handoff-icons.sprite.svg', sprite, 'image/svg+xml');
}

export function IconsPage() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [style, setStyle] = useState<StyleFilter>('line');
  const [size, setSize] = useState<number>(24);

  const filtered = useMemo(() => {
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    return iconData.icons.filter((icon) => {
      if (category !== 'all' && icon.category !== category) return false;
      if (style !== 'all' && icon.style !== 'other' && icon.style !== style) return false;
      const haystack = `${icon.name} ${icon.category} ${icon.figmaName}`.toLowerCase();
      return terms.every((term) => haystack.includes(term));
    });
  }, [query, category, style]);

  const byCategory = CATEGORIES.map((name) => ({ name, icons: filtered.filter((icon) => icon.category === name) })).filter(
    (group) => group.icons.length > 0,
  );

  return (
    <>
      <PageTitle title="Icons">
        {iconData.count.toLocaleString()} icons from the Figma <Code>Iconography</Code> section, drawn on a 24px grid
        in 21 categories. Nearly every icon comes as a Line and a Fill pair. They render with the{' '}
        <Code>Icon</Code> component and take the colour of the text around them.
      </PageTitle>

      <Callout>
        <p>
          Source: Figma Iconography (78:1625), exported and cut into one SVG per icon by{' '}
          <Code>scripts/icons/extract-icons.mjs</Code>. The set is MingCute (Apache-2.0, see{' '}
          <Code>src/assets/LICENSE-mingcute.txt</Code>). Click any icon to copy its import and JSX.
        </p>
      </Callout>

      <ExportBar subject="icons" hint="An SVG sprite (one <symbol> per icon) or the icon list as JSON.">
        <ExportAction onClick={downloadSprite}>Download SVG sprite</ExportAction>
        <ExportAction
          onClick={() => download('handoff-icons.json', `${JSON.stringify(iconData, null, 2)}\n`, 'application/json')}
        >
          Download JSON
        </ExportAction>
      </ExportBar>

      <Section title="Library">
        <div className={styles.controls}>
          <input
            className={styles.search}
            type="search"
            placeholder={`Search ${iconData.count.toLocaleString()} icons…`}
            aria-label="Search icons"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <SegmentedControl
            label="Style"
            value={style}
            onChange={setStyle}
            options={(['line', 'fill', 'all'] as const).map((option) => ({
              value: option,
              label: option === 'all' ? 'All' : option[0].toUpperCase() + option.slice(1),
            }))}
          />
          <SegmentedControl
            label="Size"
            value={size}
            onChange={setSize}
            options={SIZES.map((option) => ({ value: option as number, label: option }))}
          />
        </div>
        <div className={styles.chips} role="radiogroup" aria-label="Category">
          {['all', ...CATEGORIES].map((option) => (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={category === option}
              className={styles.chip}
              onClick={() => setCategory(option)}
            >
              {option === 'all' ? 'All' : option}
            </button>
          ))}
        </div>
        <p className={styles.count} role="status">
          {filtered.length.toLocaleString()} {filtered.length === 1 ? 'icon' : 'icons'}
        </p>
        {byCategory.map((group) => (
          <CategoryGrid key={group.name} category={group.name} icons={group.icons} size={size} />
        ))}
        {filtered.length === 0 && <p className={styles.empty}>No icons match “{query}”.</p>}
      </Section>

      <Section title="Line and Fill">
        <Prose>
          <p>
            Use <strong>Line</strong> by default. Switch to <strong>Fill</strong> for the active, selected or saved
            state of the same icon, so the change reads as state rather than as a different icon.
          </p>
        </Prose>
        <Example
          files={[
            { name: 'IconLineFill.tsx', code: iconLineFillCode },
            { name: 'IconLineFill.module.css', code: iconLineFillCss },
          ]}
        >
          <IconLineFill />
        </Example>
      </Section>

      <Section title="Size">
        <Prose>
          <p>
            Icons are drawn on a 24px grid with about 2px of padding. Use 24px in layouts, 20px in dense lists and
            beside Small text, and 16px inside buttons (the <Code>Icon</Code> default, as the Button uses).
          </p>
        </Prose>
        <Example files={[{ name: 'IconSizes.tsx', code: iconSizesCode }]}>
          <IconSizes />
        </Example>
      </Section>

      <Section title="Colour">
        <Prose>
          <p>
            Icons are single-colour and fill with <Code>currentColor</Code>. Set colour on the parent with an icon or
            text token, never on the SVG.
          </p>
        </Prose>
        <Example
          files={[
            { name: 'IconColour.tsx', code: iconColourCode },
            { name: 'IconColour.module.css', code: iconColourCss },
          ]}
          stage="on-canvas"
        >
          <IconColour />
        </Example>
      </Section>

      <Section title="Icon Props">
        <PropsTable
          rows={[
            {
              name: 'src',
              type: 'string',
              description: 'URL of a single-colour SVG, e.g. an import from src/assets/icons. Used as a mask.',
            },
            { name: 'size', type: 'number', description: 'Rendered size in px (square).', defaultValue: '16' },
            { name: 'className', type: 'string', description: 'Class on the icon, e.g. for motion hooks.' },
          ]}
        />
        <DoDont
          dos={[
            <>Import the one SVG you need, so only that icon ships.</>,
            <>
              Let the control carry the name (<Code>aria-label</Code> or visible text); icons are{' '}
              <Code>aria-hidden</Code>.
            </>,
            <>Keep Line and Fill of the same icon for one state change.</>,
          ]}
          donts={[
            <>Mix icon sets, or redraw an icon that’s in the library.</>,
            <>Use multi-colour SVGs with Icon: the mask makes them one colour.</>,
            <>Scale icons to odd sizes such as 18px; stay on 16, 20 or 24.</>,
          ]}
        />
      </Section>

      <Section title="In the product">
        <Table head={['Where', 'Figma icon', 'Asset in use', 'Library file']}>
          <tr>
            <td>Button trailing arrow</td>
            <td>
              <Code>arrow/arrow_right_line</Code>
            </td>
            <td>
              <Code>src/assets/arrow-right.svg</Code>
            </td>
            <td>
              <Code>icons/arrow/arrow-right-line.svg</Code>
            </td>
          </tr>
          <tr>
            <td>“Joined” check</td>
            <td>
              <Code>system/check_fill</Code>
            </td>
            <td>
              <Code>src/assets/check.svg</Code>
            </td>
            <td>
              <Code>icons/system/check-fill.svg</Code>
            </td>
          </tr>
          <tr>
            <td>Missing photo placeholder</td>
            <td>
              <Code>file/pic_line</Code>
            </td>
            <td>
              <Code>src/assets/image-icon.svg</Code>
            </td>
            <td>
              <Code>icons/file/pic-line.svg</Code>
            </td>
          </tr>
        </Table>
        <Prose>
          <p>
            The card still uses its original 16px exports, so it’s unchanged. They’re the same artwork as the library
            files and can be swapped for them.
          </p>
        </Prose>
      </Section>

      <Section title="Figma notes">
        <Prose>
          <ul>
            <li>
              69 icon components have their artwork 24px left of the component’s own position (for example{' '}
              <Code>weather/sun_line</Code>, the flags and most of Design). The export script re-aligns them; in Figma
              they’d look offset when placed.
            </li>
            <li>
              <Code>upload_2_fill</Code> exists twice in File (with and without the <Code>file/</Code> prefix); one is
              kept.
            </li>
            <li>
              <Code>Ωomega</Code> and <Code>&amp;and</Code> are saved as <Code>omega</Code> and <Code>and</Code>.
            </li>
            <li>
              The section’s icon colour variables (<Code>Icon/neutral #565b5f</Code>, <Code>Icon Gray #6F7783</Code>)
              differ from the card’s <Code>Icons/neutral #656f78</Code>. Icons here use <Code>currentColor</Code>, so
              no colour changed.
            </li>
            <li>The 268 multi-colour brand logos (32px) in the same section aren’t included.</li>
          </ul>
        </Prose>
      </Section>
    </>
  );
}
