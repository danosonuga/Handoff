import { useEffect, useLayoutEffect, useRef, type RefObject } from 'react';

/**
 * Emil Kowalski's "tab indicator with a color transition" (github.com/emilkowalski/skills, MIT):
 * an active-styled copy of a list sits over the real one, clipped to the
 * selected item. Moving the clip moves the background and text colour as one
 * element, so they can't drift apart, and nothing animates width or position.
 *
 * `overlayRef` must cover `rootRef` exactly (position: absolute; inset: 0).
 * The clip glides when `key` changes and snaps on first paint and when the
 * layout changes (resize, a group opening or closing).
 */
export function useClipIndicator(
  rootRef: RefObject<HTMLElement | null>,
  overlayRef: RefObject<HTMLElement | null>,
  findActive: () => HTMLElement | null | undefined,
  key: unknown,
) {
  const placed = useRef(false);
  const find = useRef(findActive);
  find.current = findActive;

  const place = (animate: boolean) => {
    const root = rootRef.current;
    const overlay = overlayRef.current;
    if (!root || !overlay) return;
    const active = find.current();
    // The active item can be hidden (e.g. inside a collapsed group).
    if (!active || active.offsetParent === null) {
      overlay.style.visibility = 'hidden';
      placed.current = false;
      return;
    }
    overlay.style.visibility = '';
    const box = root.getBoundingClientRect();
    const item = active.getBoundingClientRect();
    const radius = getComputedStyle(active).borderTopLeftRadius;
    const clip = `inset(${item.top - box.top}px ${box.right - item.right}px ${box.bottom - item.bottom}px ${item.left - box.left}px round ${radius})`;
    if (animate && placed.current) {
      overlay.style.clipPath = clip;
      return;
    }
    // First paint or a layout change: place it without a transition.
    overlay.style.transition = 'none';
    overlay.style.clipPath = clip;
    void overlay.offsetWidth;
    overlay.style.transition = '';
    placed.current = true;
  };

  useLayoutEffect(() => {
    place(true);
  }, [key]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const observer = new ResizeObserver(() => place(false));
    observer.observe(root);
    return () => observer.disconnect();
  }, []);
}
