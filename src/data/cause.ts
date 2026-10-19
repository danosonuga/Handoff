import heroImage from '../assets/cause-hero.jpg';
import orgLogo from '../assets/org-logo.png';
import type { Cause } from '../components/CauseCard/CauseCard';

/** V1 sample content, taken from the Figma frame. */
export const makokoTeachingCause: Cause = {
  title: 'Weekend Teaching Program at Makoko Community',
  imageSrc: heroImage,
  imageAlt:
    'Children in football jerseys gathered outdoors with a volunteer at the Makoko weekend teaching program',
  org: {
    name: 'Education First Nigeria',
    logoSrc: orgLogo,
    logoAlt: 'Education First Nigeria logo',
    verified: true,
  },
  volunteersJoined: 4,
  volunteerGoal: 20,
};
