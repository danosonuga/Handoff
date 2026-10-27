import { ProgressBar } from '@/components/ProgressBar/ProgressBar';

// The fill clamps to 100%; screen readers still hear "25 of 20".
export default function OverGoalProgress() {
  return <ProgressBar value={25} max={20} label="Volunteers joined" />;
}
