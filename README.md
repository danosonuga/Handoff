# Cause Card — V1 (Figma baseline)

A React implementation of a volunteering cause card, built from a Figma design via the Figma MCP server. This is the **V1 baseline** for a design-to-code demonstration: a later V2 Figma update will be applied to this codebase so the two versions can be compared.

- Figma file: [Untitled — `hiZ7TLrohRMQJ7PcOBhf2f`](https://www.figma.com/design/hiZ7TLrohRMQJ7PcOBhf2f/Untitled?node-id=15-3&m=dev)
- Card frame: `V1` (15:3, card node 15:88)
- Button states: `Button` (29:447)

## Setup

Requires Node 20+.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check (tsc) + production build into dist/
npm run preview  # serve the production build
```

Stack: Vite, React and TypeScript, styled with CSS Modules. Runtime dependencies are `react` and `react-dom` only. Dev dependencies are `vite`, `@vitejs/plugin-react`, `typescript` and the React type packages.

## Project structure

```
src/
├── main.tsx                  # entry; loads tokens + global styles
├── App.tsx / App.module.css  # stands in for the 1440×1024 Figma canvas
├── styles/
│   ├── tokens.css            # design tokens as CSS variables
│   └── global.css            # minimal reset, font, body background
├── assets/                   # images and icons (see "Assets")
├── data/cause.ts             # V1 sample content
└── components/
    ├── CauseCard/            # composition + overlap layout
    ├── CauseCardMedia/       # hero image, overlay slot, missing-image fallback
    ├── Pill/                 # translucent chip
    ├── OrgLogo/              # Figma "Logo" instance
    ├── OrgByline/            # org name + verified badge
    ├── StatPanel/            # caps label, value, supporting content
    ├── ProgressBar/          # continuous joined / goal bar
    ├── Button/               # Figma "Button" instance (default / clicked / disabled)
    └── Icon/                 # renders a single-colour SVG in currentColor
```

Each component owns one `.tsx` and one `.module.css` file. Components only read shared values from `tokens.css` and never style each other's internals. A parent influences a child through props or a `className` on the child's root, for example how `CauseCard` sets the overlap margin on `CauseCardMedia`.

## Figma → React mapping

| Figma node | Figma type | React | Notes |
|---|---|---|---|
| `V1` 15:3 (1440×1024) | frame | `App` | White canvas, card centred |
| `V1` 15:88 | frame | `CauseCard` | Owns all card layout and the logo overlap |
| Frame 15:89 (hero) | frame + image fill | `CauseCardMedia` | `overlay` slot pins content top-left at 16/16 |
| Frame 15:90 | frame | `Pill` | "4 volunteers joined" |
| `Logo` 15:94 | **component instance** | `OrgLogo` | |
| Frame 15:96 + `Badge` 15:98 | frame | `OrgByline` | Badge is the exported Figma SVG |
| Text 15:101 | text | `<h3>` in `CauseCard` | Clamped to 2 lines |
| Frame 15:102 | frame | `StatPanel` | `<dl>` for label/value |
| `Loader` 15:107 | frame (not an instance) | `ProgressBar` | See "Layout decisions" |
| `Button` 15:140 / 29:323 · 29:336 · 29:404 | **component instance** | `Button` | `leadingIcon` / `trailingIcon` mirror the instance's icon slots |
| `arrow/arrow_right_line`, missing-image icon | icon | `Icon` | Mask-based, so it follows the state's text colour |

Code Connect is not configured in the Figma file (`get_code_connect_map` returned no mappings).

## Design tokens

All tokens live in [`src/styles/tokens.css`](src/styles/tokens.css). Each one carries a comment with its Figma variable or style name.

| Group | Tokens | Figma source |
|---|---|---|
| Text colour | `--color-text-{default,neutral,on-solid-bg,disabled}` | `Text/*` |
| Icon colour | `--color-icon-{on-solid-bg,neutral}` | `Icons/*` |
| Background | `--color-bg-{canvas,on-canvas,default,secondary}` | `Background/*`, `Secondary/secondary_100` |
| Buttons | `--color-button-{primary,primary-clicked,disabled}` | `Buttons/*` |
| Typography | `--type-{small-bold,button-large,micro-bold,micro-medium,micro-regular,caps}` (CSS `font` shorthand), `--type-caps-tracking` | Text styles of the same names |
| Spacing | `--space-{2,8,10,12,14,16}` | Auto-layout gaps and padding |
| Radii | `--radius-{xs,md,lg,xl,track,full}` | 4 / 12 / 16 / 20 / 32 / 9999 |
| Elevation | `--shadow-{card,logo,button-inset}` | Drop-shadow stacks from the card, logo and button |

Two raw Figma values aren't variables, so they stay scoped to their component:

- the pill background `rgb(44 50 55 / 0.6)` (Text/default at 60%) in `Pill.module.css`
- the progress gradient end stop `#8c400c` in `ProgressBar.module.css`

## Layout decisions

- **Flexbox throughout.** Each Figma auto-layout frame becomes a flex column with the same gap and padding.
- **Logo overlap.** Figma uses −22px item spacing between the hero and the body. Here the hero gets `margin-bottom: calc(-1 * var(--card-logo-overlap))`. The body is `position: relative` and comes later in source order, so the logo paints above the image without z-index or absolute positioning.
- **Absolute positioning** is used in one place only: the pill overlay inside the hero, which matches Figma.
- **Responsive.** The card is `width: 100%; max-width: 368px`, so at desktop it is exactly 368 × 463, as in Figma. On narrow screens it shrinks within a 16px page gutter. The hero keeps its 352:153 ratio, the title wraps and the progress bar stretches.
- **Progress** is continuous: fill width = `volunteersJoined / volunteerGoal`, clamped to 0–100%. The Figma file draws it as six segments with only the first visible. As agreed, that is treated as one point on a fluid bar, not as a stepped bar. The gradient sits on the fill, so it always spans the filled length.
- **Text overflow.** The title is clamped to 2 lines with an ellipsis. The org name is truncated to 1 line so the verified badge stays in view.
- **Button states.** Default, clicked and disabled come from Figma 29:447. "Clicked" is visual only, shown with `:active`; the button triggers no join workflow. Disabled uses the native `disabled` attribute. A `:focus-visible` outline was added for keyboard accessibility.
- **Missing image.** If `imageSrc` is absent or fails to load, the hero area is filled with `Background/on-canvas` and shows a 24px image icon in `Icons/neutral`. The placeholder is hidden from assistive technology because there is no image content to describe.

## Assets

| File | Source |
|---|---|
| `cause-hero.jpg` | Figma image fill on 15:89 (original 716×477 JPEG) |
| `org-logo.png` | Figma image inside the `Logo` instance (2000×2000 PNG) |
| `verified-badge.svg` | Figma export of `Badge` 15:98 |
| `arrow-right.svg` | Figma export of `arrow/arrow_right_line` |
| `image-icon.svg` | **Substitution:** MingCute `file/pic_line`, mingcute_icon@2.9.72 (Apache-2.0, see `LICENSE-mingcute.txt`) |

Figma MCP asset URLs expire after about 7 days, so every asset is committed to the repo.

## Substitutions and known differences

- **Font.** SF Pro is Apple's system font and is not self-hosted, for licensing reasons. The stack is `"SF Pro Text", "SF Pro", -apple-system, BlinkMacSystemFont, system-ui, "Segoe UI", Roboto, …`. Weights 510 and 590 render exactly only with Apple's variable system font. Other platforms round to the nearest available weight and may differ slightly in text width.
- **Missing-image icon.** The Figma file has no image icon. The MingCute `pic_line` glyph matches the naming of the file's other icons (`arrow_right_line`, `check_fill`). MingCute has no icon called `image_line`.
- **`Icons/neutral`.** This variable isn't bound in the V1 frame. `#656f78` was confirmed during review and matches `Text/neutral`.
- **Title colour.** Figma uses raw `#2c3237`; mapped to `--color-text-default` (same value).
- **Button label trim.** Figma trims the label to cap height. The CSS uses `text-box: trim-both cap alphabetic`, which current Chrome and Safari support. Older browsers ignore it, and the label may then sit up to about 1px off.
- **Pill height.** Figma fixes the pill at 28px with 8px vertical padding, which overflows its 20px line. The CSS keeps the 28px height and centres the text, which looks the same.
- **Progress fill** at the sample data (4 of 20 = 20%) is about 10px wider than the Figma drawing, which shows one of six segments (16.7%).
- **Stat panel backdrop blur** (6px) is kept from Figma, although it has no visible effect over the white card.

## V1 → V2 demonstration

1. **The baseline is this commit** (`V1 — Figma baseline`).
2. **Update the design** in Figma, either in a new frame (for example `V2`) or as edits to variables and components.
3. **Re-inspect** the changed nodes with the Figma MCP (`get_design_context`, `get_variable_defs`, `get_screenshot`).
4. **Apply changes at the right layer:**
   - variable or style changes → `tokens.css` only
   - component changes (for example new button states) → that component's folder
   - layout or content changes → `CauseCard` and `data/cause.ts`
5. **Compare** with `git diff <V1 commit>`. Rendered output can be compared against both Figma frames at desktop (1440) and mobile (375) widths.

Because tokens, components and content are kept separate, the size of the V2 diff should match the size of the design change.
