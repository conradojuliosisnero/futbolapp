import Link from 'next/link';
import { Media } from '@/components/ui';
import styles from './HighlightCard.module.css';

export default function HighlightCard({ item }) {
  return (
    <Link href={item.href ?? '#'} className={styles.card}>
      <div className={styles.thumb}>
        <Media src={item.thumb} label="miniatura video" rounded="lg" />
        <span className={styles.duration}>{item.duration}</span>
      </div>
      <span className={styles.title}>{item.title}</span>
    </Link>
  );
}
