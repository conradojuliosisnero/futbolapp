import Link from 'next/link';
import styles from './BackLink.module.css';

export default function BackLink({ href, children }) {
  return <Link href={href} className={styles.link}>← {children}</Link>;
}
