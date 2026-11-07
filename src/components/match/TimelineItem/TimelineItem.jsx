import { Media } from '@/components/ui';
import { cx } from '@/lib/utils/cx';
import styles from './TimelineItem.module.css';

/** type: 'goal' | 'goal-against' | 'yellow' | 'red' | 'sub' */
export default function TimelineItem({ event }) {
  const hot = event.type === 'goal';
  return (
    <li className={styles.item}>
      <span className={cx(styles.minute, hot && styles.hot)}>{event.min}</span>
      <div className={styles.body}>
        <div className={cx(styles.title, hot && styles.big)}>
          {(event.type === 'yellow' || event.type === 'red') && <span className={cx(styles.card, styles[event.type])} aria-hidden />}
          {event.title}
        </div>
        {event.text && <p className={styles.text}>{event.text}</p>}
        {event.clip && <div className={styles.clip}><Media src={event.clipThumb} label="clip repetición" rounded="md" /></div>}
      </div>
    </li>
  );
}
