import styles from './CountBadge.module.css';

export default function CountBadge({ value }) {
  if (!value) return null;
  return <span className={styles.badge}>{value}</span>;
}
