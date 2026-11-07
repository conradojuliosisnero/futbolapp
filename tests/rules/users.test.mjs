// Reglas del documento del usuario (favoritos, mi equipo, preferencias). Corren contra el emulador (npm run test:rules).
import { test, before, after, beforeEach } from 'node:test';
import { readFileSync } from 'node:fs';
import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc, updateDoc, deleteField, serverTimestamp, FieldPath } from 'firebase/firestore';

let env;
before(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-minuto90',
    firestore: { rules: readFileSync('firestore.rules', 'utf8'), host: '127.0.0.1', port: 8085 },
  });
});
after(() => env?.cleanup());
beforeEach(() => env.clearFirestore());

const db = (uid) => env.authenticatedContext(uid, { email: `${uid}@test.com` }).firestore();
const nacional = { name: 'Atl. Nacional', crest: 'https://x/5264.png', league: 'col.1' };

/** Documento tal como lo crea la app al registrarse (ensureUserDoc). */
const newUser = (uid) => setDoc(doc(db(uid), 'users', uid), {
  displayName: 'Ana', email: `${uid}@test.com`, photoURL: null, follows: { teams: {}, leagues: {}, matches: {} }, createdAt: serverTimestamp(),
});

test('registro: la app puede crear el documento del usuario', async () => {
  await assertSucceeds(newUser('ana'));
});

test('favoritos: agregar (id con punto de ESPN), elegir mi equipo y quitar', async () => {
  await newUser('ana');
  const ref = doc(db('ana'), 'users', 'ana');
  await assertSucceeds(updateDoc(ref, new FieldPath('favorites', 'col.1-5264'), { ...nacional, addedAt: serverTimestamp() }));
  await assertSucceeds(updateDoc(ref, 'favoriteTeam', { id: 'col.1-5264', ...nacional }, new FieldPath('favorites', 'col.1-5264'), { ...nacional, addedAt: serverTimestamp() }));
  await assertSucceeds(updateDoc(ref, new FieldPath('favorites', '86'), { name: 'Real Madrid', crest: null, league: 'PD', addedAt: serverTimestamp() }));
  await assertSucceeds(updateDoc(ref, new FieldPath('favorites', 'col.1-5264'), deleteField(), 'favoriteTeam', null));
  await assertSucceeds(updateDoc(ref, { animations: false }));
});

test('favoritos: no en el documento de otro usuario, ni más de 50', async () => {
  await newUser('ana');
  await newUser('beto');
  await assertFails(updateDoc(doc(db('beto'), 'users', 'ana'), new FieldPath('favorites', '86'), { name: 'X' }));
  const many = Object.fromEntries(Array.from({ length: 51 }, (_, i) => [`t${i}`, { name: `T${i}` }]));
  await assertFails(updateDoc(doc(db('ana'), 'users', 'ana'), { favorites: many }));
});

test('sin documento de usuario, actualizar falla (por eso la app lo crea si falta)', async () => {
  await assertFails(updateDoc(doc(db('ana'), 'users', 'ana'), new FieldPath('favorites', '86'), { name: 'Real Madrid' }));
});

test('ligas: seguir y dejar de seguir (código con punto)', async () => {
  await newUser('ana');
  const ref = doc(db('ana'), 'users', 'ana');
  await assertSucceeds(updateDoc(ref, new FieldPath('follows', 'leagues', 'col.1'), { name: 'Liga BetPlay', crest: null }));
  await assertSucceeds(updateDoc(ref, new FieldPath('follows', 'leagues', 'col.1'), deleteField()));
});

test('puntos: la app no puede escribir su juego, el ranking ni los votos (solo el servidor)', async () => {
  await newUser('ana');
  await assertFails(updateDoc(doc(db('ana'), 'users', 'ana'), { game: { points: 99999 } }));
  await assertFails(setDoc(doc(db('ana'), 'leaderboard', 'ana'), { name: 'Ana', points: 99999 }));
  await assertFails(setDoc(doc(db('ana'), 'predictions', 'PL-1', 'votes', 'ana'), { pick: 'home', at: serverTimestamp() }));
  await assertSucceeds(getDoc(doc(db('ana'), 'leaderboard', 'beto')));
});
