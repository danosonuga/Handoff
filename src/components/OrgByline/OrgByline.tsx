import verifiedBadge from '../../assets/verified-badge.svg';
import styles from './OrgByline.module.css';

type OrgBylineProps = {
  name: string;
  verified?: boolean;
};

/** Organisation name with an optional verified badge (Figma "Badge" 15:98). */
export function OrgByline({ name, verified = false }: OrgBylineProps) {
  return (
    <p className={styles.byline}>
      <span className={styles.name}>{name}</span>
      {verified && (
        <img className={styles.badge} src={verifiedBadge} alt="Verified" title="Verified" width={12} height={12} />
      )}
    </p>
  );
}
