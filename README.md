# Cause Card

A React + TypeScript volunteering cause card, implemented from Figma and animated with [transitions.dev](https://github.com/Jakubantalik/transitions.dev) recipes.

**Quick links:**
- [Quick start](#quick-start)
- [How it fits together](#how-it-fits-together)
- [Common changes](#common-changes)
- [Gotchas](#gotchas-read-before-editing)
- [Component reference](#component-reference)
- [Design provenance](#design-provenance)
- [History](#history)

## Quick start

Requires **Node 20.19+ or 22.12+** (Vite 8).

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check (tsc) + production build into dist/
npm run preview  # serve the production build
```

- **Stack:** Vite, React 19, TypeScript and CSS Modules.
- **Runtime dependencies:** only `react` and `react-dom`. No UI, styling, icon or animation libraries.
- **Tests:** there is no test suite or linter. `npm run build` is the check, because it type-checks first.

## How it fits together

There are three layers, and each kind of change belongs in exactly one of them:

```
 tokens.css ──────────┐   design values: colour, type, spacing, radii, shadows, motion timing
 transitions.css ─────┤   global t-* animation classes (transitions.dev, verbatim)
                      ▼
 components/*  ───────┐   small presentational pieces, each with its own .module.css
                      ▼
 CauseCard ◄────────── data/cause.ts   (content: title, images, org, counts)
     ▲
   App  (centres the card on a white page)
```

The component tree:

```
CauseCard                      layout, logo overlap, CTA colour
├── CauseCardMedia             hero photo, load/reveal/fallback, overlay slot
│   └── Pill                   "4 volunteers joined" (count via AnimatedNumber)
├── header
│   ├── OrgLogo                logo tile (overlaps the photo by 22px)
│   ├── OrgByline              org name + verified badge
│   └── <h3>                   title, clamped to 2 lines
├── StatPanel                  "20" ··· "VOLUNTEERS NEEDED" (value via AnimatedNumber)
│   └── ProgressBar            joined / goal fill
└── Button                     "Join as a volunteer →" (Icon for the arrow)
```

**Conventions**

- **One folder per component,** holding a `.tsx` and a `.module.css`.
- **No shared internals.** Components only read shared values from `tokens.css` and never style each other's internals.
- **Parents talk to children in two ways:**
  1. Props, or a `className` on the child's root. For example, `CauseCard` sets the overlap margin on `CauseCardMedia`.
  2. Documented CSS custom properties. For example, `CauseCard` sets `--button-bg` on `Button`.
- **Layout is Flexbox.** Absolute positioning is used only for the pill over the photo and the stacked reveal layers inside the photo.
- **Semantic markup:** `<article>`, `<header>`, `<h3>`, a `<dl>` for the stat, a native `<button>`, and `role="progressbar"` with values.

## Common changes

| I want to… | Edit | Notes |
|---|---|---|
| Change the card's text, images or counts | `src/data/cause.ts` | Typed by `Cause` in `CauseCard.tsx`. `imageSrc` is optional: leave it out to show the placeholder. |
| Render a different cause or several cards | `src/App.tsx` | Pass any `Cause` object: `<CauseCard cause={myCause} />`. |
| Change the button label, disable it, or handle clicks | `CauseCard` props | `ctaLabel`, `ctaDisabled`, `onCtaClick`. There is no join workflow; the button only calls `onCtaClick`. |
| Change a colour, text style, spacing, radius or shadow | `src/styles/tokens.css` | Each token is commented with its Figma variable. Prefer changing a token over adding raw values in a component. |
| Change the purple CTA (or its pressed state) | `tokens.css` → `--color-cta-volunteer*`, `--shadow-cta-volunteer-inset` | Applied only to this card's button via `.cta` in `CauseCard.module.css`. Other buttons use `--color-button-*`. |
| Recolour any other `Button` | Set `--button-bg`, `--button-bg-pressed`, `--button-shadow` on it via a class | Unset values fall back to the primary tokens. Disabled styling always wins. |
| Change the photo's proportions | `CauseCardMedia.module.css` → `aspect-ratio` | Currently 352 / 195, from Figma V2. |
| Change how far the logo overlaps the photo | `CauseCard.module.css` → `--card-logo-overlap` | 22px, from Figma. |
| Change the title's line limit | `CauseCard.module.css` → `.title` `-webkit-line-clamp` / `line-clamp` | 2 lines. |
| Change motion speed, distance or easing | `tokens.css`, **Motion** section | `--learn-*` arrow hover, `--pulse-*` / `--reveal-*` photo, `--resize-*` progress, `--digit-*` numbers. |
| Remove an animation | Drop its `t-*` class from the component | See the [Motion](#motion) table for which class lives where. Leave `transitions.css` intact. |
| Add another transitions.dev recipe | Paste its CSS verbatim into `transitions.css` and its `:root` variables into the **Motion** section of `tokens.css` | Keep the recipe's `prefers-reduced-motion` block. Check the [licence](#licences). |
| Add an icon | Put a **single-colour** SVG in `src/assets/`, then render `<Icon src={...} />` | `Icon` uses the SVG as a mask filled with `currentColor`, so multi-colour SVGs lose their colours. Use a plain `<img>` for those, as the verified badge does. |

## Gotchas (read before editing)

1. **The logo overlap depends on stacking order.**
   - The photo has a −22px bottom margin, and the card body is `position: relative` and comes later in the source, so the logo paints on top.
   - `CauseCardMedia` sets `isolation: isolate` to keep the reveal layers' `z-index` (1 and 2) inside the photo. **Remove it and the photo covers the logo.**
   - Adding `z-index` to the body or the photo will also change the result.
2. **`transitions.css` uses global class names on purpose.**
   - The `t-*` classes come from transitions.dev and are pasted verbatim, so they are not CSS Modules.
   - They are imported last in `main.tsx`, after the component CSS, so where specificity is equal they win (for example, `.t-learn-chevron` sets `display: inline-flex` over `Icon`'s `inline-block`).
   - Don't rename them, and don't move them into a module.
3. **`AnimatedNumber` changes the DOM directly.**
   - When `value` changes, a layout effect removes `is-animating`, forces a reflow, then re-adds it, as the recipe documents. This is the only way to restart a CSS animation.
   - The group's `className` is a constant string so React never overwrites that class. **Don't make it dynamic.**
   - Digits render as `aria-hidden` spans, and the full number is in a visually hidden span, so screen readers read "20", not "2 0".
4. **`CauseCardMedia` tracks the photo through four states: loading, loaded, cached and failed.**
   - A photo that is already decoded when the component mounts is "cached" and shows instantly, with no fade.
   - That check runs **once per `src`**. React StrictMode runs effects twice in development, and a second check would mistake a freshly loaded photo for a cached one.
   - A failed photo unmounts the `<img>` and leaves the static placeholder.
5. **`ProgressBar` renders at 0% for one frame.** It switches to the real value on the next animation frame so the width transition plays on load. Screen readers get the real value (`aria-valuenow`) from the first render.
6. **The stat row is visually reversed.** `StatPanel` keeps label before value in the markup, so screen readers announce "Volunteers needed: 20", while `flex-direction: row-reverse` shows the value on the left. Reorder with CSS, not markup.
7. **The arrow hover only applies to buttons with a `trailingIcon`.** `Button` adds `t-learn` only then. It is suppressed on disabled buttons by a project rule at the end of the learn-more section in `transitions.css`.
8. **Pressed is visual only.** The "clicked" state is `:active`. Nothing persists after a click unless you build it.
9. **Animations respect reduced motion.** Every recipe keeps a `@media (prefers-reduced-motion: reduce)` block. Leave it in place when editing.

## Component reference

| Component | Props | Purpose |
|---|---|---|
| `CauseCard` | `cause: Cause`, `ctaLabel?` (default "Join as a volunteer"), `ctaDisabled?`, `onCtaClick?` | Lays out the whole card |
| `CauseCardMedia` | `src?`, `alt`, `overlay?: ReactNode`, `className?` | Photo with load reveal, missing/broken fallback, and a top-left overlay slot |
| `Pill` | `children`, `className?` | Translucent dark chip |
| `OrgLogo` | `src`, `alt` | 64px logo tile with ring and shadow |
| `OrgByline` | `name`, `verified?` | Org name (one line, ellipsis) and optional verified badge |
| `StatPanel` | `label`, `value: ReactNode`, `children?` | Value/label row plus content below |
| `ProgressBar` | `value`, `max`, `label` (accessible name) | Continuous fill = `value / max`, clamped to 0–100% |
| `Button` | all native `<button>` props, `leadingIcon?`, `trailingIcon?` | Primary button with default, pressed (`:active`) and disabled states. `type` defaults to `"button"`. |
| `Icon` | `src`, `size?` (default 16), `className?` | Single-colour SVG rendered in `currentColor`; decorative (`aria-hidden`) |
| `AnimatedNumber` | `value: number` | Number that pops in its changed digits when the value changes |

```ts
type Cause = {
  title: string;
  imageSrc?: string;         // omit to show the placeholder
  imageAlt: string;
  org: { name: string; logoSrc: string; logoAlt: string; verified?: boolean };
  volunteersJoined: number;  // pill count + progress value
  volunteerGoal: number;     // "20 volunteers needed" + progress max
};
```

## Project structure

```
src/
├── main.tsx                  # entry; imports App, then tokens, global and transitions CSS
├── App.tsx / App.module.css  # centres the card on a white page (the Figma canvas)
├── data/cause.ts             # sample content
├── styles/
│   ├── tokens.css            # design + motion tokens (CSS custom properties)
│   ├── global.css            # reset, font, body background
│   └── transitions.css       # transitions.dev recipes (global t-* classes)
├── assets/                   # images and icons, all committed
└── components/
    ├── CauseCard/  CauseCardMedia/  Pill/  OrgLogo/  OrgByline/
    └── StatPanel/  ProgressBar/  Button/  Icon/  AnimatedNumber/
```

## Design tokens

All tokens are in [`src/styles/tokens.css`](src/styles/tokens.css), each commented with its Figma source.

| Group | Tokens | Source |
|---|---|---|
| Text | `--color-text-{default,neutral,on-solid-bg,disabled}` | Figma `Text/*` |
| Icons | `--color-icon-{on-solid-bg,neutral}` | Figma `Icons/*` |
| Backgrounds | `--color-bg-{canvas,on-canvas,default,secondary}` | Figma `Background/*` |
| Buttons | `--color-button-{primary,primary-clicked,disabled}` | Figma `Buttons/*` |
| Card CTA | `--color-cta-volunteer` (#622efe), `--color-cta-volunteer-pressed`, `--shadow-cta-volunteer-inset` | #622efe is a raw Figma fill; **the pressed colour and shadow are derived** (see [Design provenance](#design-provenance)) |
| Typography | `--type-{small-bold,button-large,micro-bold,micro-medium,micro-regular,caps}`, `--type-caps-tracking` | Figma text styles, written as the CSS `font` shorthand |
| Spacing | `--space-{2,8,10,12,14,16}` | Auto-layout gaps and padding |
| Radii | `--radius-{xs,md,lg,xl,track,full}` | 4 / 12 / 16 / 20 / 32 / 9999 px |
| Elevation | `--shadow-{card,logo,button-inset}` | Figma drop shadows |
| Motion | `--learn-*`, `--pulse-*`, `--reveal-*`, `--resize-*`, `--digit-*` | transitions.dev defaults (not in Figma) |

Two values live in their component instead of `tokens.css`, because Figma sets them directly rather than through variables:

- the pill background `rgb(44 50 55 / 0.6)` (Text/default at 60%), in `Pill.module.css`
- the card's logo overlap `--card-logo-overlap: 22px`, in `CauseCard.module.css`

## Motion

The Figma frames contain no motion; all animation is an addition using four [transitions.dev](https://github.com/Jakubantalik/transitions.dev/tree/main/skills/transitions-dev) recipes.

| Recipe | Where (class) | Behaviour | Tokens |
|---|---|---|---|
| 24 Learn more hover | `Button` trailing icon (`t-learn`, `t-learn-chevron`) | Arrow eases 2px right on hover over 350ms. Off when disabled. | `--learn-*` |
| 14 Skeleton loader and reveal | `CauseCardMedia` (`t-skel`, `t-skel-skeleton`, `t-skel-content`) | Placeholder pulses once while loading, then cross-fades to the photo as a 2px blur clears (400ms). Instant if cached. | `--pulse-*`, `--reveal-*` |
| 01 Card resize | `ProgressBar` fill (`t-resize`) | Grows in from 0 on load and tweens on value changes (300ms) | `--resize-*` |
| 02 Number pop-in | `AnimatedNumber` (`t-digit-group`, `t-digit`) | Changed digits rise in with blur (500ms). Nothing animates on first render. | `--digit-*` |

**Adaptations from the recipes**

- **The arrow only slides.** The recipe also spreads a two-path chevron's arms, but the Figma arrow is a single path. The arm rules are kept but match nothing.
- **JavaScript is React state.** The recipes' orchestration scripts are reimplemented as React state in `CauseCardMedia`, `ProgressBar` and `AnimatedNumber`.
- **Only the variables these recipes use are installed,** not the skill's full `_root.css`.

## Design provenance

**Figma:** [Untitled — `hiZ7TLrohRMQJ7PcOBhf2f`](https://www.figma.com/design/hiZ7TLrohRMQJ7PcOBhf2f/Untitled?node-id=24-217&m=dev)

| Frame | Node | Role |
|---|---|---|
| `V2` | 24:217 (card 24:247) | **Current design** |
| `V1` | 15:3 (card 15:88) | Original baseline |
| `Button` | 29:447 | Default / clicked / disabled states |

**Figma → React** (V2 node IDs, with V1 IDs in brackets)

| Figma node | React | Notes |
|---|---|---|
| Card 24:247 [15:88] | `CauseCard` | |
| Hero 24:248 [15:89] | `CauseCardMedia` | Pill overlay at 16/16 |
| Pill 24:249 [15:90] | `Pill` | |
| `Logo` instance 24:253 [15:94] | `OrgLogo` | Figma component instance |
| Byline 24:255 + `Badge` 24:257 | `OrgByline` | |
| Title 24:260 [15:101] | `<h3>` in `CauseCard` | |
| Stats panel 24:261 [15:102] | `StatPanel` | |
| `Loader` 24:266 [15:107] | `ProgressBar` | Figma draws six segments. Implemented as one continuous bar, by agreement. |
| `Button` instance 24:274 [15:140], states 29:323 / 29:336 / 29:404 | `Button` | Figma component instance; icon slots map to `leadingIcon` / `trailingIcon` |
| `arrow/arrow_right_line` | `Icon` | |

Code Connect isn't set up in the Figma file.

**Substitutions and derived values**

- **Not from Figma:**
  - **Pressed CTA `#35198c` and its inset shadow** are derived. V2's `#622efe` is `Buttons/primary` with only the hue shifted (207° → 255°), and the same shift was applied to `Buttons/primary-clicked`. White text on it has a contrast ratio of 12.6:1. *These should be added to Figma as variables.*
  - **Missing-image icon** is MingCute `file/pic_line`, because Figma has no image icon.
  - **`Icons/neutral` `#656f78`** was confirmed in review; it isn't bound in the frames.
- **Mapped to tokens:**
  - **Title colour** is raw `#2c3237` in Figma; mapped to `--color-text-default` (same value).
  - **Progress fill** is raw `#ff7415` in Figma; mapped to `--color-bg-secondary` (same value).
- **Rendering differences:**
  - **Font.** SF Pro isn't bundled, for licensing reasons. It loads from the system with fallbacks. Weights 510 and 590 are exact only on Apple platforms; elsewhere text may be slightly wider or narrower.
  - **Button label** uses `text-box: trim-both cap alphabetic`, as Figma does. Browsers without support render up to about 1px off.
  - **Progress width** at 4 of 20 is 20%, about 10px wider than Figma's one-sixth segment.
- **Kept as-is:**
  - **Title copy** "Lagos state nigeria" is verbatim from Figma, by agreement.
  - **Stats panel backdrop blur** (6px) is kept from Figma, although it has no visible effect over white.

**Assets** (in `src/assets/`, all committed because Figma asset URLs expire after about 7 days)

| File | Source |
|---|---|
| `cause-hero.jpg` | Figma image fill (716×477 JPEG) |
| `org-logo.png` | Figma `Logo` image (2000×2000 PNG) |
| `verified-badge.svg` | Figma `Badge` export (multi-colour; rendered as `<img>`) |
| `arrow-right.svg` | Figma `arrow/arrow_right_line` export |
| `image-icon.svg` | MingCute `file/pic_line` |

### Licences

- **transitions.dev recipes** (`src/styles/transitions.css`, motion tokens): [Transitions.dev License](https://transitions.dev/terms.html). Free for personal and commercial use in your products. Don't republish the collection as a transitions library.
- **MingCute icon** (`image-icon.svg`): Apache-2.0; see `src/assets/LICENSE-mingcute.txt`.

## History

| Commit | What it contains |
|---|---|
| `680e95e` V1 — Figma baseline | First implementation of Figma V1 (15:3) |
| `cf12efb` V2 — Figma update | Figma V2 (24:217): taller photo, one-row stats, solid progress, purple CTA, new copy |
| `3171701` Motion — transitions.dev | Arrow hover, photo reveal, progress resize, number pop-in |
| `7895bb2` Motion — progress load-in | Progress fill animates in on load |

**V1 → V2 changes in detail**

| # | Change | V1 → V2 | Code |
|---|---|---|---|
| 1 | Photo height | 153 → 195 px (card 463 → 493) | `CauseCardMedia.module.css` `aspect-ratio` |
| 2 | Header → stats gap | 8 → 16 px | Removed `.content` wrapper in `CauseCard` |
| 3 | Stats layout | stacked → one row, value left | `StatPanel.module.css` |
| 4 | Stats copy | "Volunteers" / "20 volunteers" → "Volunteers needed" / "20" | `CauseCard.tsx` |
| 5 | Progress fill | gradient → solid `#ff7415` | `ProgressBar.module.css` |
| 6 | Button fill | `#2ea1fe` → `#622efe` (this button only) | `tokens.css`, `CauseCard.module.css` `.cta`, `Button.module.css` |
| 7 | Button label | "Join Cause" → "Join as a volunteer" | `CauseCard.tsx` |
| 8 | Title | adds "in Lagos state nigeria" | `data/cause.ts` |

To see any step's changes, diff two commits from the table above (for example, `git diff 680e95e cf12efb`).

### Applying the next Figma update

1. Inspect the changed frame with the Figma MCP (`get_design_context`, `get_variable_defs`, `get_screenshot`) and compare it with the current frame.
2. Put each change in the layer it belongs to:
   - variables and styles → `tokens.css`
   - a component's look → that component's `.module.css`
   - layout → `CauseCard`
   - content → `data/cause.ts`
3. Check the result against the Figma frame at desktop (1440) and mobile (375 and 320) widths, then commit it as its own step so the diff matches the design change.
