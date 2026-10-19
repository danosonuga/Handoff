import { CauseCard } from './components/CauseCard/CauseCard';
import { makokoTeachingCause } from './data/cause';
import styles from './App.module.css';

/** Stands in for the 1440 × 1024 Figma canvas: the card is centred on white. */
export function App() {
  return (
    <main className={styles.canvas}>
      <CauseCard cause={makokoTeachingCause} />
    </main>
  );
}
