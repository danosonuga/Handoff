import { ProgressBar } from '@/components/ProgressBar/ProgressBar';

// Nobody has joined yet: only the track shows.
export default function EmptyProgress() {
  return <ProgressBar value={0} max={20} label="Volunteers joined" />;
}
