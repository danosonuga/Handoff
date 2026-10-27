import { CauseCard } from '@/components/CauseCard/CauseCard';
import { makokoTeachingCause } from '@/data/cause';

export default function DefaultCard() {
  return <CauseCard cause={makokoTeachingCause} />;
}
