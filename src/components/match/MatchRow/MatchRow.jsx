import Link from 'next/link';
import { cx } from '@/lib/utils/cx';
import styles from './MatchRow.module.css';

export default function MatchRow({ match, highlighted = false }) {
  const live = match.status === 'live';
  return (
    <Link href={`/partido/${match.id}`} className={cx(styles.row, highlighted && styles.highlighted)}>
      <span className={live ? styles.live : styles.time}>{live ? match.minute : match.kickoff}</span>
      <span className={styles.teams}>
        <span>{match.home.name}</span>
        <span className={styles.away}>{match.away.name}</span>
      </span>
      {match.score
        ? <span className={styles.score}><span>{match.score[0]}</span><span>{match.score[1]}</span></span>
        : <span className={styles.remind}>Recordar</span>}
    </Link>
  );
}
