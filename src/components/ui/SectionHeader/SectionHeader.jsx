import Link from 'next/link';
import styles from './SectionHeader.module.css';

export default function SectionHeader({ title, meta, action }) {
  return (
    <header className={styles.header}>
      <h2 className={styles.title}>{title}</h2>
      {action ? <Link href={action.href} className={styles.meta}>{action.label}</Link> : meta && <span className={styles.meta}>{meta}</span>}
    </header>
  );
}
