import styles from './Lineups.module.css';

export default function Lineups({ match }) {
  const { lineups, home, away } = match;
  if (!lineups) return <p className={styles.empty}>Alineaciones no disponibles.</p>;
  return (
    <div className={styles.grid}>
      {[[home, lineups.home], [away, lineups.away]].map(([team, players]) => (
        <div key={team.code} className={styles.column}>
          <div className={styles.team}>{team.name}</div>
          <ol className={styles.players}>{players.map((p) => <li key={p}>{p}</li>)}</ol>
        </div>
      ))}
    </div>
  );
}
