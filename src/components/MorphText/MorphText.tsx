import { useEffect, useLayoutEffect, useRef } from 'react';

type MorphTextProps = {
  text: string;
};

const ms = (name: string) =>
  parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name)) || 0;

/**
 * transitions.dev "Text morph": when `text` changes, the letters the old and
 * new labels share stay put; only the differing part cross-blurs while its
 * width eases. React never renders children here — the recipe owns the DOM.
 */
export function MorphText({ text }: MorphTextProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const timer = useRef<number>(undefined);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const prev = el.dataset.text;
    // First render (and StrictMode's re-run): just paint the text.
    if (prev === undefined || prev === text) {
      el.dataset.text = text;
      el.textContent = text;
      return;
    }
    el.dataset.text = text;
    window.clearTimeout(timer.current);

    // Shared start (a) and shared end (b).
    let a = 0;
    while (a < prev.length && a < text.length && prev[a] === text[a]) a++;
    let b = 0;
    while (b < prev.length - a && b < text.length - a && prev[prev.length - 1 - b] === text[text.length - 1 - b]) b++;

    const swap = document.createElement('span');
    swap.className = 't-morph-swap';
    const out = document.createElement('span');
    out.className = 't-morph-old';
    out.setAttribute('aria-hidden', 'true');
    out.textContent = prev.slice(a, prev.length - b);
    const inn = document.createElement('span');
    inn.className = 't-morph-new';
    inn.textContent = text.slice(a, text.length - b);
    swap.append(out, inn);

    el.textContent = '';
    el.append(text.slice(0, a), swap, text.slice(text.length - b));

    swap.style.width = `${out.getBoundingClientRect().width}px`;
    void swap.offsetWidth; // force reflow so the width transitions
    swap.classList.add('is-morphing');
    swap.style.width = `${inn.getBoundingClientRect().width}px`;

    timer.current = window.setTimeout(() => {
      el.textContent = text;
    }, Math.max(ms('--text-morph-dur'), ms('--text-morph-resize-dur')) + 40);
  }, [text]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  return <span ref={ref} className="t-morph" />;
}
