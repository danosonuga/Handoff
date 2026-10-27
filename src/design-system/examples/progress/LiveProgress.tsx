import { useState } from 'react';
import { Button } from '@/components/Button/Button';
import { ProgressBar } from '@/components/ProgressBar/ProgressBar';
import styles from './LiveProgress.module.css';

const GOAL = 20;

/** The fill tweens whenever the value changes. */
export default function LiveProgress() {
  const [joined, setJoined] = useState(4);

  return (
    <div className={styles.live}>
      <ProgressBar value={joined} max={GOAL} label="Volunteers joined" />
      <div className={styles.controls}>
        <Button disabled={joined === 0} onClick={() => setJoined(joined - 1)}>
          Remove one
        </Button>
        <span className={styles.count}>
          {joined} / {GOAL}
        </span>
        <Button disabled={joined === GOAL} onClick={() => setJoined(joined + 1)}>
          Add one
        </Button>
      </div>
    </div>
  );
}
