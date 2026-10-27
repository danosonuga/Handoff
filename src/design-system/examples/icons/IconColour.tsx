import infoLine from '@/assets/icons/system/information-line.svg';
import { Icon } from '@/components/Icon/Icon';
import styles from './IconColour.module.css';

// Icons fill with currentColor, so they follow the surrounding text colour.
export default function IconColour() {
  return (
    <>
      <span className={styles.neutral}>
        <Icon src={infoLine} size={20} /> Icons/neutral
      </span>
      <span className={styles.solid}>
        <Icon src={infoLine} size={20} /> Icons/on-solid-bg
      </span>
    </>
  );
}
