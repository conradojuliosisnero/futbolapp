import styles from './SplitBar.module.css';

/**
 * Barra proporcional segmentada.
 * segments: [{ value: 61, tone: 'accent' | 'neutral1' | 'neutral2' }]
 */
export default function SplitBar({ segments, height = 6 }) {
  return (
    <div className={styles.bar} style={{ height }}>
      {segments.map((s, i) => (
        <div key={i} className={styles.seg} style={{ flex: s.value, background: `var(--pb-color-${s.tone ?? 'accent'})` }} />
      ))}
    </div>
  );
}
