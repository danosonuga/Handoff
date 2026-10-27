import orgLogo from '@/assets/org-logo.png';
import { CauseCard, type Cause } from '@/components/CauseCard/CauseCard';

// No imageSrc → the media slot shows its placeholder. No verified badge.
const beachCleanUp: Cause = {
  title: 'Saturday beach clean-up at Elegushi with the coastal care team and local schools',
  imageAlt: 'Volunteers collecting litter on Elegushi beach',
  org: {
    name: 'Coastal Care Lagos',
    logoSrc: orgLogo,
    logoAlt: 'Coastal Care Lagos logo',
  },
  volunteersJoined: 1,
  volunteerGoal: 12,
};

export default function PlaceholderCard() {
  return <CauseCard cause={beachCleanUp} ctaLabel="Sign up" />;
}
