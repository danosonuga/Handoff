import { ProgressBar } from '@/components/ProgressBar/ProgressBar';
import { StatPanel } from '@/components/StatPanel/StatPanel';

// How the cause card uses it: the stat names the goal, the bar shows how close it is.
export default function ProgressInStatPanel() {
  return (
    <StatPanel label="Volunteers needed" value="20">
      <ProgressBar value={4} max={20} label="Volunteers joined" />
    </StatPanel>
  );
}
