import { SplitBar } from '@/components/ui';
import styles from './StatsList.module.css';

export default function StatsList({ stats = [] }) {
  return (
    <div className={styles.list}>
      {stats.map((s) => (
        <div key={s.label} className={styles.row}>
          <div className={styles.values}><span>{s.home}</span><span className={styles.label}>{s.label}</span><span>{s.away}</span></div>
          <SplitBar segments={[{ value: s.home, tone: 'accent' }, { value: s.away, tone: 'neutral-1' }]} />
        </div>
      ))}
    </div>
  );
}
