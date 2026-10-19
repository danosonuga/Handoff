import type { CSSProperties } from 'react';
import styles from './Icon.module.css';

type IconProps = {
  /** URL of a single-colour SVG asset. Its shape is used as a mask. */
  src: string;
  /** Rendered size in px (square). */
  size?: number;
  className?: string;
};

/**
 * Renders an exported SVG asset in `currentColor`, so one Figma icon
 * can follow the text colour of whatever state it sits in.
 * Decorative by default; label the parent control instead.
 */
export function Icon({ src, size = 16, className }: IconProps) {
  const style = { '--icon-src': `url("${src}")`, '--icon-size': `${size}px` } as CSSProperties;

  return (
    <span aria-hidden="true" className={[styles.icon, className].filter(Boolean).join(' ')} style={style} />
  );
}
