import { useState } from 'react';
import arrowRight from '../../assets/arrow-right.svg';
import checkIcon from '../../assets/check.svg';
import { AnimatedNumber } from '../AnimatedNumber/AnimatedNumber';
import { Button } from '../Button/Button';
import { CauseCardMedia } from '../CauseCardMedia/CauseCardMedia';
import { OrgByline } from '../OrgByline/OrgByline';
import { OrgLogo } from '../OrgLogo/OrgLogo';
import { Pill } from '../Pill/Pill';
import { ProgressBar } from '../ProgressBar/ProgressBar';
import { StatPanel } from '../StatPanel/StatPanel';
import styles from './CauseCard.module.css';

export type Cause = {
  title: string;
  imageSrc?: string;
  imageAlt: string;
  org: {
    name: string;
    logoSrc: string;
    logoAlt: string;
    verified?: boolean;
  };
  volunteersJoined: number;
  volunteerGoal: number;
};

type CauseCardProps = {
  cause: Cause;
  ctaLabel?: string;
  /** Label once joined; the button then becomes disabled. */
  ctaJoinedLabel?: string;
  ctaDisabled?: boolean;
  onCtaClick?: () => void;
};

const volunteerNoun = (count: number) => (count === 1 ? 'volunteer' : 'volunteers');

/** Figma frame "V2" (24:247) — volunteering cause card. */
export function CauseCard({
  cause,
  ctaLabel = 'Join as a volunteer',
  ctaJoinedLabel = 'Joined',
  ctaDisabled,
  onCtaClick,
}: CauseCardProps) {
  const { title, imageSrc, imageAlt, org, volunteersJoined, volunteerGoal } = cause;
  // Visual state only: no join workflow or data change.
  const [joined, setJoined] = useState(false);
  const handleCtaClick = () => {
    setJoined(true);
    onCtaClick?.();
  };

  return (
    <article className={styles.card}>
      <CauseCardMedia
        className={styles.media}
        src={imageSrc}
        alt={imageAlt}
        overlay={
          <Pill>
            {/* One inline wrapper, so the flex pill keeps the space before the noun. */}
            <span>
              <AnimatedNumber value={volunteersJoined} /> {volunteerNoun(volunteersJoined)} joined
            </span>
          </Pill>
        }
      />

      <div className={styles.body}>
        <header className={styles.header}>
          <OrgLogo src={org.logoSrc} alt={org.logoAlt} />
          <div className={styles.heading}>
            <OrgByline name={org.name} verified={org.verified} />
            <h3 className={styles.title}>{title}</h3>
          </div>
        </header>

        <StatPanel label="Volunteers needed" value={<AnimatedNumber value={volunteerGoal} />}>
          <ProgressBar value={volunteersJoined} max={volunteerGoal} label="Volunteers joined" />
        </StatPanel>

        <Button
          className={styles.cta}
          // Joined: the arrow swaps out and a check swaps in before the label.
          leadingIcon={joined ? checkIcon : undefined}
          trailingIcon={joined ? undefined : arrowRight}
          disabled={ctaDisabled || joined}
          onClick={handleCtaClick}
        >
          {joined ? ctaJoinedLabel : ctaLabel}
        </Button>
      </div>
    </article>
  );
}
