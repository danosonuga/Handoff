import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import styles from './CopyTooltip.module.css';

type CopyTooltipProps = {
  /** Text put on the clipboard. */
  text: string;
  /** Accessible name, e.g. "Copy H5/Bold CSS". */
  label: string;
  /** The element people hover and click (a type specimen, a colour, an icon). */
  children: ReactNode;
  className?: string;
};

/** How long "Copied" stays up after a tap on touch screens, which have no hover-out. */
const TOUCH_HIDE_MS = 1200;

const ms = (name: string) =>
  parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name)) || 0;

/**
 * Shared across every CopyTooltip on the page, so "neighbours open instantly"
 * works between a specimen and the next, or across the icon grid.
 */
const group = { openCount: 0, lastClosedAt: 0 };
const groupIsWarm = () => group.openCount > 0 || performance.now() - group.lastClosedAt < ms('--docs-tooltip-group');

/**
 * Click an element to copy; a "Copy" tooltip explains it on hover.
 * Emil Kowalski's tooltip recipe (github.com/emilkowalski/skills, MIT):
 * - the first tooltip waits (--docs-tooltip-delay) so sweeping across the grid
 *   doesn't fire it, then scales and fades in from the element (125ms ease-out);
 * - while one is open (or just closed), neighbours open instantly with no animation;
 * - pressing the element scales it to 0.97 (press feedback); the label changes
 *   to "Copied" in place, with no extra motion;
 * - keyboard focus shows it instantly: keyboard actions are never animated.
 */
export function CopyTooltip({ text, label, children, className }: CopyTooltipProps) {
  const id = useId();
  const pointerType = useRef('mouse');
  const showTimer = useRef<number>(undefined);
  const hideTimer = useRef<number>(undefined);
  const [open, setOpenState] = useState(false);
  const [instant, setInstant] = useState(false);
  const [copied, setCopied] = useState(false);

  // The shared group is updated in the same event, not in an effect, so a
  // neighbour entered right after this one closes already sees it.
  const isOpen = useRef(false);
  const setOpen = (next: boolean) => {
    if (next === isOpen.current) return;
    isOpen.current = next;
    if (next) group.openCount++;
    else (group.openCount--, (group.lastClosedAt = performance.now()));
    setOpenState(next);
  };

  useEffect(
    () => () => {
      window.clearTimeout(showTimer.current);
      window.clearTimeout(hideTimer.current);
      if (isOpen.current) (group.openCount--, (group.lastClosedAt = performance.now()));
    },
    [],
  );

  /** `immediately`: keyboard focus, which is never animated or delayed. */
  const show = (immediately: boolean) => {
    window.clearTimeout(showTimer.current);
    window.clearTimeout(hideTimer.current);
    if (immediately || groupIsWarm()) {
      setInstant(true);
      setOpen(true);
    } else {
      setInstant(false);
      showTimer.current = window.setTimeout(() => setOpen(true), ms('--docs-tooltip-delay'));
    }
  };

  // A tooltip that opened instantly also closes instantly; the first one fades out.
  const hide = () => {
    window.clearTimeout(showTimer.current);
    setOpen(false);
    // Back to "Copy" once it has gone.
    hideTimer.current = window.setTimeout(() => setCopied(false), ms('--docs-tooltip-dur'));
  };

  const copy = () => {
    navigator.clipboard?.writeText(text).then(() => {
      window.clearTimeout(hideTimer.current);
      setCopied(true);
      if (!open) {
        // Clicked before the hover delay: show "Copied" now, with the normal entrance.
        window.clearTimeout(showTimer.current);
        setInstant(false);
        setOpen(true);
      }
      if (pointerType.current === 'touch') hideTimer.current = window.setTimeout(hide, TOUCH_HIDE_MS);
    });
  };

  return (
    <span className={`${styles.group} ${className ?? ''}`} onPointerLeave={hide}>
      <button
        type="button"
        className={styles.trigger}
        aria-label={label}
        aria-describedby={id}
        onPointerDown={(event) => {
          pointerType.current = event.pointerType;
        }}
        onPointerEnter={(event) => {
          // Hover tooltips are for fine pointers; touch gets "Copied" on tap.
          if (event.pointerType === 'mouse' || event.pointerType === 'pen') show(false);
        }}
        onFocus={(event) => {
          if (event.target.matches(':focus-visible')) show(true);
        }}
        onBlur={hide}
        onClick={copy}
      >
        {children}
      </button>
      <span
        id={id}
        className={styles.tip}
        role="tooltip"
        aria-hidden={!open}
        data-open={open || undefined}
        data-instant={instant || undefined}
      >
        {copied ? 'Copied' : 'Copy'}
      </span>
      <span className={styles.status} role="status">
        {copied ? 'Copied to clipboard' : ''}
      </span>
    </span>
  );
}
