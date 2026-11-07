import 'server-only';
import { createHash } from 'node:crypto';
import { FieldValue } from 'firebase-admin/firestore';
import { POINTS, checkin, readNews, addPoints, dayKey } from './rules.mjs';

// Puntos del lado del servidor (firebase-admin). Todo en transacciones: dos pestañas a la vez no suman doble.
// gameLog/{uid}_{clave}: lo ya premiado (una noticia, un voto, un acierto). Solo el servidor lo lee/escribe.
// leaderboard/{uid}: copia pública para el ranking { name, photo, points, streak, best, updatedAt }.

const hash = (s) => createHash('sha1').update(String(s)).digest('hex').slice(0, 20);
const logId = (uid, key) => `${uid}_${key}`.replace(/\//g, '_');

function publish(tx, db, uid, user, game) {
  tx.set(db.collection('leaderboard').doc(uid), {
    name: (user.displayName || 'Hincha').slice(0, 40),
    photo: user.photoURL ?? null,
    points: game.points ?? 0,
    streak: game.streak ?? 0,
    best: game.best ?? 0,
    last: game.last ?? null,
    updatedAt: FieldValue.serverTimestamp(),
  });
}

/**
 * Aplica `change(game)` al juego del usuario. change devuelve { added, game } o null (no suma).
 * key: si se da, solo se premia una vez (gameLog). Devuelve { added, game }.
 */
async function apply(db, uid, change, key) {
  const userRef = db.collection('users').doc(uid);
  const logRef = key && db.collection('gameLog').doc(logId(uid, key));
  return db.runTransaction(async (tx) => {
    const [userSnap, logSnap] = await Promise.all([tx.get(userRef), logRef ? tx.get(logRef) : null]);
    if (!userSnap.exists) return { added: 0, game: null };
    const user = userSnap.data();
    if (logSnap?.exists) return { added: 0, game: user.game ?? null };
    const r = change(user.game ?? {});
    if (!r) return { added: 0, game: user.game ?? null };
    tx.update(userRef, { game: r.game });
    if (logRef) tx.set(logRef, { at: FieldValue.serverTimestamp(), points: r.added });
    publish(tx, db, uid, user, r.game);
    return r;
  });
}

const fixed = (points) => (game) => ({ added: points, game: addPoints(game, points, dayKey()) });

export const awardCheckin = (db, uid) => apply(db, uid, (g) => checkin(g, dayKey()));
export const awardNews = (db, uid, url) => apply(db, uid, (g) => readNews(g, dayKey()), `news_${hash(url)}`);
export const awardVote = (db, uid, matchId) => apply(db, uid, fixed(POINTS.vote), `vote_${hash(matchId)}`);
export const awardCorrect = (db, uid, matchId) => apply(db, uid, fixed(POINTS.correct), `win_${hash(matchId)}`);
