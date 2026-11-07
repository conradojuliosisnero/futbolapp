import { LiveBadge, TeamCrest, Media, Button, Eyebrow } from '@/components/ui';
import FollowToggle from '../FollowToggle';
import styles from './FeaturedMatch.module.css';

export default function FeaturedMatch({ match, image }) {
  const { home, away, score, scorers } = match;
  return (
    <article className={styles.card}>
      <Media src={image} label="imagen de estadio / jugada" className={styles.media} />
      <div className={styles.fade} />
      {match.status === 'live' && <div className={styles.badge}><LiveBadge>{match.minute}</LiveBadge></div>}

      <div className={styles.body}>
        <div className={styles.info}>
          <Eyebrow tone="accent">{match.league} · {match.round}</Eyebrow>
          <div className={styles.teams}>
            <div className={styles.team}><TeamCrest team={home} /><span>{home.name}</span></div>
            <div className={styles.score}>{score[0]}<span className={styles.sep}>–</span>{score[1]}</div>
            <div className={`${styles.team} ${styles.away}`}><TeamCrest team={away} /><span>{away.name}</span></div>
          </div>
          {scorers && <p className={styles.scorers}>{scorers.home.join(', ')} · {scorers.away.join(', ')}</p>}
        </div>
        <div className={styles.cta}>
          <Button href={`/partido/${match.id}`} size="lg" className={styles.watch}>▶ Ver en vivo</Button>
          <FollowToggle />
        </div>
      </div>
    </article>
  );
}
