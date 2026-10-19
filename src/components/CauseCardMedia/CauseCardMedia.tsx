import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import imageIcon from '../../assets/image-icon.svg';
import { Icon } from '../Icon/Icon';
import styles from './CauseCardMedia.module.css';

type CauseCardMediaProps = {
  src?: string;
  alt: string;
  /** Content pinned to the top-left corner, e.g. a Pill. */
  overlay?: ReactNode;
  className?: string;
};

type LoadState = 'loading' | 'loaded' | 'cached' | 'failed';

/**
 * Hero image area with an overlay slot. The placeholder doubles as the
 * loading skeleton: transitions.dev "Skeleton loader and reveal" cross-fades
 * to the photo once it loads. Missing or broken images keep the placeholder.
 */
export function CauseCardMedia({ src, alt, overlay, className }: CauseCardMediaProps) {
  const imageRef = useRef<HTMLImageElement>(null);
  const [load, setLoad] = useState<{ src?: string; state: LoadState }>({ src, state: 'loading' });
  // Reset when the source changes, without an effect.
  const state: LoadState = !src ? 'failed' : load.src === src ? load.state : 'loading';

  // A photo already in the browser cache shows at once, with no reveal.
  // Checked once per src, before paint: a re-run (e.g. StrictMode) after the
  // photo has loaded would otherwise mistake a fresh load for a cached one.
  const checkedSrc = useRef<string>(undefined);
  useLayoutEffect(() => {
    if (checkedSrc.current === src) return;
    checkedSrc.current = src;
    const image = imageRef.current;
    if (image?.complete && image.naturalWidth > 0) setLoad({ src, state: 'cached' });
  }, [src]);

  const revealed = state === 'loaded' || state === 'cached';
  const wrapClass = [
    styles.media,
    't-skel',
    revealed && 'is-revealed',
    state === 'cached' && 'is-resetting',
    className,
  ];

  return (
    <div className={wrapClass.filter(Boolean).join(' ')}>
      {/* Decorative: there is no image content to describe. */}
      <div
        className={[styles.placeholder, 't-skel-skeleton', state === 'loading' && 'is-pulsing'].filter(Boolean).join(' ')}
        aria-hidden="true"
      >
        <Icon src={imageIcon} size={24} />
      </div>
      {state !== 'failed' && (
        <img
          ref={imageRef}
          className={`${styles.image} t-skel-content`}
          src={src}
          alt={alt}
          onLoad={() => setLoad((prev) => (prev.src === src && prev.state === 'cached' ? prev : { src, state: 'loaded' }))}
          onError={() => setLoad({ src, state: 'failed' })}
        />
      )}
      {overlay && <div className={styles.overlay}>{overlay}</div>}
    </div>
  );
}
