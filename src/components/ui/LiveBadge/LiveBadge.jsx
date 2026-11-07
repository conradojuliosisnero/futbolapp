import styles from './LiveBadge.module.css';

export default function LiveBadge({ children = 'EN VIVO', pulse = true }) {
  return (
    <span className={styles.badge}>
      <span className={pulse ? styles.dotPulse : styles.dot} aria-hidden />
      {children}
    </span>
  );
}
