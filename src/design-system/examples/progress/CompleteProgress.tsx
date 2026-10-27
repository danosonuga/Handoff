import { ProgressBar } from '@/components/ProgressBar/ProgressBar';

// Goal reached: the fill spans the whole track.
export default function CompleteProgress() {
  return <ProgressBar value={20} max={20} label="Volunteers joined" />;
}
