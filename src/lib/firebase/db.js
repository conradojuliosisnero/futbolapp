// Datos del usuario en Firestore. Los partidos/ligas vienen de la API de fútbol, aquí solo sus ids.
// Estructura completa en firestore.rules (comentario de cabecera).
import {
  doc, setDoc, updateDoc, deleteDoc, deleteField, serverTimestamp, onSnapshot, FieldPath,
  collection, query, where, orderBy, limit, getCountFromServer,
} from 'firebase/firestore';
import { db } from './client';

// Un voto por usuario y partido (el id del doc es el uid, así no se puede votar dos veces).
export function vote(uid, matchId, pick) {
  return setDoc(doc(db, 'predictions', String(matchId), 'votes', uid), { pick, at: serverTimestamp() });
}

// Conteo con agregación del servidor: sin contadores que un cliente pueda falsear.
// shortcut: 3 count queries por partido (1 lectura por cada 1000 votos), si hay mucho tráfico cachear en el servidor.
export async function getVotes(matchId) {
  const votes = collection(db, 'predictions', String(matchId), 'votes');
  const count = async (pick) => (await getCountFromServer(query(votes, where('pick', '==', pick)))).data().count;
  const [home, draw, away] = await Promise.all(['home', 'draw', 'away'].map(count));
  return { home, draw, away, total: home + draw + away };
}

// ---------- mi equipo, avisos y dispositivos ----------

const teamInfo = (team) => ({ name: team.name, crest: team.crest ?? null, league: team.league ?? null });

/** Equipo de "Mi equipo" (también lo usa el servidor para saber a quién avisar). También queda en favoritos. */
export function setFavoriteTeam(uid, team) {
  return updateDoc(
    doc(db, 'users', uid),
    'favoriteTeam', { id: String(team.id), ...teamInfo(team) },
    // FieldPath: los ids de ESPN llevan punto ("col.1-5264") y con texto Firestore lo tomaría como subcampo.
    new FieldPath('favorites', String(team.id)), { ...teamInfo(team), addedAt: serverTimestamp() },
  );
}

/** Agrega un equipo a favoritos. team: { id, name, crest, league } */
export function addFavorite(uid, team) {
  return updateDoc(doc(db, 'users', uid), new FieldPath('favorites', String(team.id)), { ...teamInfo(team), addedAt: serverTimestamp() });
}

/** Quita un equipo de favoritos (si era "Mi equipo", también deja de serlo). */
export function removeFavorite(uid, teamId, { wasMyTeam = false } = {}) {
  const extra = wasMyTeam ? ['favoriteTeam', null] : [];
  return updateDoc(doc(db, 'users', uid), new FieldPath('favorites', String(teamId)), deleteField(), ...extra);
}

/** Animaciones de los partidos encendidas o apagadas (preferencia de la cuenta). */
export function saveAnimationsPref(uid, enabled) {
  return updateDoc(doc(db, 'users', uid), { animations: Boolean(enabled) });
}

/** Qué avisos quiere el usuario. prefs: { goals, kickoff, final, redCards, reminders, teamNews } */
export function saveNotifyPrefs(uid, prefs) {
  return updateDoc(doc(db, 'users', uid), { notify: prefs });
}

// El id del documento es un hash del endpoint: el mismo dispositivo no se guarda dos veces.
async function subscriptionId(endpoint) {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(endpoint));
  return [...new Uint8Array(bytes)].slice(0, 16).map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** Guarda este dispositivo para recibir push. subscription: PushSubscription del navegador. */
export async function savePushSubscription(uid, subscription) {
  const { endpoint, keys } = subscription.toJSON();
  await setDoc(doc(db, 'users', uid, 'pushSubscriptions', await subscriptionId(endpoint)), {
    endpoint, keys: { p256dh: keys.p256dh, auth: keys.auth }, userAgent: navigator.userAgent.slice(0, 200), createdAt: serverTimestamp(),
  });
}

export async function removePushSubscription(uid, endpoint) {
  await deleteDoc(doc(db, 'users', uid, 'pushSubscriptions', await subscriptionId(endpoint)));
}

/** Escucha el documento del usuario (favoriteTeam, notify, follows). Devuelve la función para dejar de escuchar. */
export function watchUserDoc(uid, cb) {
  // cb(datos, existe): existe=false solo si el documento realmente no está (no ante errores de red o permisos).
  return onSnapshot(doc(db, 'users', uid), (snap) => cb(snap.data() ?? null, snap.exists()), () => cb(null, undefined));
}

/** Escucha la bandeja de avisos (los 50 más recientes). */
export function watchInbox(uid, cb) {
  const q = query(collection(db, 'users', uid, 'notifications'), orderBy('createdAt', 'desc'), limit(50));
  return onSnapshot(q, (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }))), () => cb([]));
}

export function markRead(uid, notificationId) {
  return updateDoc(doc(db, 'users', uid, 'notifications', notificationId), { read: true });
}
