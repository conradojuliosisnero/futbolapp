import styles from './ProgressBar.module.css';

export default function ProgressBar({ value = 0 }) {
  return (
    <div className={styles.track} role="progressbar" aria-valuenow={Math.round(value * 100)} aria-valuemin={0} aria-valuemax={100}>
      <div className={styles.fill} style={{ width: `${value * 100}%` }} />
    </div>
  );
}
