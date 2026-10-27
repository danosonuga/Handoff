# Icons

1,214 single-colour icons (24px grid, Line and Fill), cut from the Figma **Iconography** section
(file `hiZ7TLrohRMQJ7PcOBhf2f`, node 78:1625). The set is [MingCute](https://www.mingcute.com/)
(Apache-2.0, see `../LICENSE-mingcute.txt`).

- `{category}/{name}.svg`: one icon, `viewBox="0 0 24 24"`, filled with `currentColor`.
- `icons.json`: every icon's name, category, style (line/fill), Figma name and node id.

Use one with the `Icon` component, which masks the SVG so it takes the text colour:

```tsx
import cakeLine from '@/assets/icons/food/cake-line.svg';

<Icon src={cakeLine} size={24} />
```

Browse, search and copy them on the design system's **Foundations → Icons** page.

## Regenerating from Figma

These files are generated; don't edit them by hand.

1. Export each category frame listed in `scripts/icons/figma-manifest.json` as SVG, saved as
   `{nodeId with - for :}.svg` (e.g. `78-3338.svg`) in one folder.
2. Run `node scripts/icons/extract-icons.mjs <that folder>`.

The script re-aligns the 69 components whose artwork sits 24px off their own frame in Figma,
and logs anything it skips. Rebuild `figma-manifest.json` from `get_metadata` on 78:1625 when
icons are added or renamed.
