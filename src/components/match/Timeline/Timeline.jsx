import TimelineItem from '../TimelineItem';
import styles from './Timeline.module.css';

export default function Timeline({ events = [] }) {
  return (
    <ol className={styles.list}>
      {events.map((e, i) => <TimelineItem key={`${e.min}-${i}`} event={e} />)}
    </ol>
  );
}
