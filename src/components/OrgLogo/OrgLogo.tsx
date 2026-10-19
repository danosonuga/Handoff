import styles from './OrgLogo.module.css';

type OrgLogoProps = {
  src: string;
  alt: string;
};

/** Figma component "Logo" — organisation mark on an elevated white tile. */
export function OrgLogo({ src, alt }: OrgLogoProps) {
  return (
    <span className={styles.tile}>
      <img className={styles.image} src={src} alt={alt} width={51.2} height={51.2} />
    </span>
  );
}
