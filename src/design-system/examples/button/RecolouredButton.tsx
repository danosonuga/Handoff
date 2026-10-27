import arrowRight from '@/assets/arrow-right.svg';
import { Button } from '@/components/Button/Button';
import styles from './RecolouredButton.module.css';

export default function RecolouredButton() {
  return (
    <Button className={styles.volunteer} trailingIcon={arrowRight}>
      Join as a volunteer
    </Button>
  );
}
