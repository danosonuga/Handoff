import { ProgressBar } from '@/components/ProgressBar/ProgressBar';

export default function DefaultProgress() {
  return <ProgressBar value={4} max={20} label="Volunteers joined" />;
}
