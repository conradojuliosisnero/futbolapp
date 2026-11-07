// Datos del usuario en Firestore. Los partidos/ligas vienen de la API de fútbol, aquí solo sus ids.
// Estructura completa en firestore.rules (comentario de cabecera).
import {
  doc, setDoc, updateDoc, deleteField, serverTimestamp,
  collection, query, where, getCountFromServer,
} from 'firebase/firestore';
import { db } from './client';

// kind: 'teams' | 'leagues' | 'matches'. item: { id, name, crest? } con el id de la API.
export function follow(uid, kind, item) {
  return updateDoc(doc(db, 'users', uid), {
    [`follows.${kind}.${item.id}`]: { name: item.name, crest: item.crest ?? null },
  });
}
export function unfollow(uid, kind, id) {
  return updateDoc(doc(db, 'users', uid), { [`follows.${kind}.${id}`]: deleteField() });
}

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
