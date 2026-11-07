import { cx } from '@/lib/utils/cx';
import styles from './Tabs.module.css';

/** Segmented control. items: [{ id, label }] */
export default function Tabs({ items, value, onChange, label }) {
  return (
    <div className={styles.tabs} role="tablist" aria-label={label}>
      {items.map((t) => (
        <button key={t.id} role="tab" aria-selected={value === t.id} className={cx(styles.tab, value === t.id && styles.active)} onClick={() => onChange(t.id)}>
          {t.label}
        </button>
      ))}
    </div>
  );
}
