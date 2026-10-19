import { useLayoutEffect, useRef } from 'react';
import styles from './AnimatedNumber.module.css';

type AnimatedNumberProps = {
  value: number;
};

const sharedPrefixLength = (a: string, b: string) => {
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  return i;
};

/**
 * transitions.dev "Number pop-in": when the value changes, the digits that
 * changed re-enter with a blurred slide. Nothing animates on first render.
 */
export function AnimatedNumber({ value }: AnimatedNumberProps) {
  const text = String(value);
  const groupRef = useRef<HTMLSpanElement>(null);
  const previous = useRef(text);
  const same = sharedPrefixLength(previous.current, text);

  // Replay: remove .is-animating, force a reflow, re-add (per the recipe).
  useLayoutEffect(() => {
    if (previous.current === text) return;
    previous.current = text;
    const group = groupRef.current;
    if (!group) return;
    group.classList.remove('is-animating');
    void group.offsetHeight;
    group.classList.add('is-animating');
  }, [text]);

  return (
    <>
      <span className={styles.srOnly}>{text}</span>
      <span ref={groupRef} className="t-digit-group" aria-hidden="true">
        {text.split('').map((char, i) => (
          <span
            key={i}
            className="t-digit"
            data-same={i < same ? '' : undefined}
            data-stagger={i === text.length - 2 ? '1' : i === text.length - 1 ? '2' : undefined}
          >
            {char}
          </span>
        ))}
      </span>
    </>
  );
}
