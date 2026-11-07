// Salas de partido (Firestore). Las reglas (firestore.rules) hacen cumplir: invitación por enlace,
// 1 mensaje cada 60 s, 200 caracteres y que solo los miembros lean el chat. Probadas en tests/rules/rooms.test.mjs.
import {
  doc, collection, writeBatch, serverTimestamp, Timestamp, onSnapshot, query, orderBy, limitToLast, deleteDoc, setDoc,
} from 'firebase/firestore';
import { db } from './client';

export const MESSAGE_COOLDOWN_S = 60;
export const MESSAGE_MAX = 200;
const ROOM_HOURS = 6;

const who = (user) => ({ name: (user.displayName || user.email?.split('@')[0] || 'Hincha').slice(0, 80), photo: user.photoURL?.slice(0, 500) ?? null });
const member = (user) => ({ ...who(user), joinedAt: serverTimestamp(), lastMessageAt: null, lastMessageId: null });

/** Crea la sala del partido y entra como su creador. Devuelve el id (que es la invitación). */
export async function createRoom(user, match) {
  const ref = doc(collection(db, 'rooms'));
  const b = writeBatch(db);
  b.set(ref, {
    matchId: String(match.id),
    title: `${match.home.name} vs ${match.away.name}`.slice(0, 120),
    ownerUid: user.uid,
    ownerName: who(user).name,
    createdAt: serverTimestamp(),
    // 5 min menos que el máximo que aceptan las reglas, por si el reloj del dispositivo está adelantado.
    expiresAt: Timestamp.fromMillis(Date.now() + ROOM_HOURS * 3600_000 - 5 * 60_000),
  });
  b.set(doc(db, 'rooms', ref.id, 'members', user.uid), member(user));
  await b.commit();
  return ref.id;
}

export const joinRoom = (roomId, user) => setDoc(doc(db, 'rooms', roomId, 'members', user.uid), member(user));
export const leaveRoom = (roomId, uid) => deleteDoc(doc(db, 'rooms', roomId, 'members', uid));
export const deleteRoom = (roomId) => deleteDoc(doc(db, 'rooms', roomId));
export const deleteMessage = (roomId, msgId) => deleteDoc(doc(db, 'rooms', roomId, 'messages', msgId));

/** Envía un mensaje: en el mismo lote actualiza "mi último mensaje" (así las reglas aplican el límite de 60 s). */
export async function sendMessage(roomId, user, text) {
  const clean = text.trim().slice(0, MESSAGE_MAX);
  if (!clean) return;
  const ref = doc(collection(db, 'rooms', roomId, 'messages'));
  const b = writeBatch(db);
  b.set(ref, { uid: user.uid, ...who(user), text: clean, createdAt: serverTimestamp() });
  b.update(doc(db, 'rooms', roomId, 'members', user.uid), { lastMessageAt: serverTimestamp(), lastMessageId: ref.id });
  await b.commit();
}

/** cb(room | null) — null si no existe o no hay acceso. */
export function watchRoom(roomId, cb) {
  return onSnapshot(doc(db, 'rooms', roomId), (s) => cb(s.exists() ? { id: s.id, ...s.data() } : null), () => cb(null));
}
/** cb(miembro | null) — mi ficha en la sala (si soy miembro). */
export function watchMyMembership(roomId, uid, cb) {
  // Al unirse, Firestore muestra la ficha al instante (escritura local) antes de que el servidor la confirme.
  // Se espera la confirmación: si el chat pidiera los mensajes antes, el servidor aún no lo consideraría miembro.
  return onSnapshot(doc(db, 'rooms', roomId, 'members', uid), { includeMetadataChanges: true }, (s) => {
    if (s.metadata.hasPendingWrites) return;
    cb(s.exists() ? s.data() : null);
  }, () => cb(null));
}
export function watchMembers(roomId, cb) {
  return onSnapshot(collection(db, 'rooms', roomId, 'members'), (s) => cb(s.docs.map((d) => ({ uid: d.id, ...d.data() }))), () => cb([]));
}
/** Últimos 100 mensajes, del más antiguo al más reciente. */
export function watchMessages(roomId, cb) {
  const q = query(collection(db, 'rooms', roomId, 'messages'), orderBy('createdAt'), limitToLast(100));
  return onSnapshot(q, (s) => cb(s.docs.map((d) => ({ id: d.id, ...d.data() }))), () => cb([]));
}
