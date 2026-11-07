import { siteConfig } from '@/config/site';
import styles from './Logo.module.css';

/** variant: 'full' (pelibox.) | 'mark' (p.) */
export default function Logo({ variant = 'full' }) {
  const text = variant === 'mark' ? siteConfig.logoMark : siteConfig.name.toLowerCase();
  return <span className={styles.logo}>{text}<span className={styles.dot}>.</span></span>;
}
