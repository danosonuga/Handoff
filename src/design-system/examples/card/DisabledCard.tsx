import { CauseCard } from '@/components/CauseCard/CauseCard';
import { makokoTeachingCause } from '@/data/cause';

export default function DisabledCard() {
  const full = { ...makokoTeachingCause, volunteersJoined: 20 };
  return <CauseCard cause={full} ctaLabel="Volunteer spots filled" ctaDisabled />;
}
