import { useState, type ReactNode } from 'react';
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

/** Hero image area with an overlay slot and a placeholder for missing or broken images. */
export function CauseCardMedia({ src, alt, overlay, className }: CauseCardMediaProps) {
  const [failedSrc, setFailedSrc] = useState<string>();
  const showImage = Boolean(src) && src !== failedSrc;

  return (
    <div className={[styles.media, className].filter(Boolean).join(' ')}>
      {showImage ? (
        <img className={styles.image} src={src} alt={alt} onError={() => setFailedSrc(src)} />
      ) : (
        // Decorative: there is no image content to describe.
        <div className={styles.placeholder} aria-hidden="true">
          <Icon src={imageIcon} size={24} />
        </div>
      )}
      {overlay && <div className={styles.overlay}>{overlay}</div>}
    </div>
  );
}
