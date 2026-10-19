import arrowRight from '../../assets/arrow-right.svg';
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
  ctaDisabled?: boolean;
  onCtaClick?: () => void;
};

const volunteers = (count: number) => `${count} ${count === 1 ? 'volunteer' : 'volunteers'}`;

/** Figma frame "V1" (15:88) — volunteering cause card. */
export function CauseCard({ cause, ctaLabel = 'Join Cause', ctaDisabled, onCtaClick }: CauseCardProps) {
  const { title, imageSrc, imageAlt, org, volunteersJoined, volunteerGoal } = cause;

  return (
    <article className={styles.card}>
      <CauseCardMedia
        className={styles.media}
        src={imageSrc}
        alt={imageAlt}
        overlay={<Pill>{volunteers(volunteersJoined)} joined</Pill>}
      />

      <div className={styles.body}>
        <div className={styles.content}>
          <header className={styles.header}>
            <OrgLogo src={org.logoSrc} alt={org.logoAlt} />
            <div className={styles.heading}>
              <OrgByline name={org.name} verified={org.verified} />
              <h3 className={styles.title}>{title}</h3>
            </div>
          </header>

          <StatPanel label="Volunteers" value={volunteers(volunteerGoal)}>
            <ProgressBar value={volunteersJoined} max={volunteerGoal} label="Volunteers joined" />
          </StatPanel>
        </div>

        <Button trailingIcon={arrowRight} disabled={ctaDisabled} onClick={onCtaClick}>
          {ctaLabel}
        </Button>
      </div>
    </article>
  );
}
