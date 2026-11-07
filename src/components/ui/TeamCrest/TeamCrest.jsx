import styles from './TeamCrest.module.css';

/** size: 'sm' (24) | 'md' (40) | 'lg' (52) */
const SIZES = { sm: 24, md: 40, lg: 52 };

export default function TeamCrest({ team, size = 'md' }) {
  const px = SIZES[size] ?? size;
  const style = { width: px, height: px };
  if (team?.crest) return <img src={team.crest} alt={team.name} className={styles.crest} style={style} />;
  return <span className={styles.crest} style={style} aria-hidden />;
}
