import orgLogo from '@/assets/org-logo.png';
import { OrgByline } from '@/components/OrgByline/OrgByline';
import { OrgLogo } from '@/components/OrgLogo/OrgLogo';
import { Pill } from '@/components/Pill/Pill';
import { ProgressBar } from '@/components/ProgressBar/ProgressBar';
import { StatPanel } from '@/components/StatPanel/StatPanel';
import styles from './CardParts.module.css';

export default function CardParts() {
  return (
    <div className={styles.parts}>
      <Pill>4 volunteers joined</Pill>

      <div className={styles.org}>
        <OrgLogo src={orgLogo} alt="Education First Nigeria logo" />
        <OrgByline name="Education First Nigeria" verified />
      </div>

      <StatPanel label="Volunteers needed" value="20">
        <ProgressBar value={4} max={20} label="Volunteers joined" />
      </StatPanel>
    </div>
  );
}
