import { TeamCrest } from '@/components/ui';
import styles from './Scoreboard.module.css';

function Side({ team, reverse }) {
  return (
    <div className={reverse ? `${styles.side} ${styles.reverse}` : styles.side}>
      <span className={styles.crest}><TeamCrest team={team} /></span>
      <span className={styles.name}>{team.name}</span>
      <span className={styles.code}>{team.code}</span>
    </div>
  );
}

export default function Scoreboard({ match }) {
  return (
    <div className={styles.board}>
      <Side team={match.home} />
      <div className={styles.center}>
        <div className={styles.score}>{match.score[0]} – {match.score[1]}</div>
        {match.clock && <div className={styles.clock}>{match.clock}</div>}
      </div>
      <Side team={match.away} reverse />
    </div>
  );
}
