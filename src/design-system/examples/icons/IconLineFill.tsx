import { useState } from 'react';
import heartFill from '@/assets/icons/shape/heart-fill.svg';
import heartLine from '@/assets/icons/shape/heart-line.svg';
import { Icon } from '@/components/Icon/Icon';
import styles from './IconLineFill.module.css';

// Line by default; Fill shows the active or selected state of the same icon.
export default function IconLineFill() {
  const [saved, setSaved] = useState(false);

  return (
    <button type="button" className={styles.save} aria-pressed={saved} onClick={() => setSaved(!saved)}>
      <Icon src={saved ? heartFill : heartLine} size={20} />
      {saved ? 'Saved' : 'Save'}
    </button>
  );
}
