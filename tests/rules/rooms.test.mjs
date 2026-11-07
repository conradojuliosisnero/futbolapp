// Pruebas de las reglas de Firestore para las salas. Corren contra el emulador (npm run test:rules), nunca contra la base real.
import { test, before, after, beforeEach } from 'node:test';
import { readFileSync } from 'node:fs';
import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc, writeBatch, collection, getDocs, deleteDoc, serverTimestamp, Timestamp } from 'firebase/firestore';

let env;
before(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-minuto90',
    firestore: { rules: readFileSync('firestore.rules', 'utf8'), host: '127.0.0.1', port: 8085 },
  });
});
after(() => env?.cleanup());
beforeEach(() => env.clearFirestore());

const ROOM = 'sala123abc';
const db = (uid) => env.authenticatedContext(uid, { email: `${uid}@test.com` }).firestore();
const anon = () => env.unauthenticatedContext().firestore();
const hoursFromNow = (h) => Timestamp.fromMillis(Date.now() + h * 3600_000);

/** Sala ya creada (saltando reglas) con su dueño como miembro. */
async function seedRoom({ expiresAt = hoursFromNow(5), members = {} } = {}) {
  await env.withSecurityRulesDisabled(async (ctx) => {
    const f = ctx.firestore();
    await setDoc(doc(f, 'rooms', ROOM), { matchId: 'col.1-1', title: 'Nacional vs Pereira', ownerUid: 'ana', ownerName: 'Ana', createdAt: Timestamp.now(), expiresAt });
    for (const [uid, data] of Object.entries({ ana: {}, ...members })) {
      await setDoc(doc(f, 'rooms', ROOM, 'members', uid), { name: uid, photo: null, joinedAt: Timestamp.now(), lastMessageAt: null, lastMessageId: null, ...data });
    }
  });
}

/** Lote de mensaje como lo hace la app: mensaje + "mi último mensaje" en la ficha. */
function sendBatch(f, uid, msgId, text = 'hola') {
  const b = writeBatch(f);
  b.set(doc(f, 'rooms', ROOM, 'messages', msgId), { uid, name: uid, photo: null, text, createdAt: serverTimestamp() });
  b.update(doc(f, 'rooms', ROOM, 'members', uid), { lastMessageAt: serverTimestamp(), lastMessageId: msgId });
  return b.commit();
}

/** Lote de creación como lo hace la app: sala + creador como miembro. */
function createBatch(f, uid, { expiresAt = hoursFromNow(6 - 5 / 60), ownerUid = uid } = {}) {
  const b = writeBatch(f);
  b.set(doc(f, 'rooms', ROOM), { matchId: 'col.1-1', title: 'Nacional vs Pereira', ownerUid, ownerName: 'Ana', createdAt: serverTimestamp(), expiresAt });
  b.set(doc(f, 'rooms', ROOM, 'members', uid), { name: 'Ana', photo: null, joinedAt: serverTimestamp(), lastMessageAt: null, lastMessageId: null });
  return b.commit();
}

test('crear sala y entrar como creador en el mismo lote', async () => {
  await assertSucceeds(createBatch(db('ana'), 'ana'));
});

test('crear sala: cierre entre 1 y 6 h, y a nombre propio', async () => {
  await assertFails(createBatch(db('ana'), 'ana', { expiresAt: hoursFromNow(7) }));   // más de 6 h
  await assertFails(createBatch(db('ana'), 'ana', { expiresAt: hoursFromNow(0.5) })); // menos de 1 h
  await assertFails(createBatch(db('ana'), 'ana', { ownerUid: 'otro' }));             // a nombre de otro
  await assertFails(createBatch(anon(), 'ana'));                                        // sin sesión
});

test('nadie puede listar salas; con el enlace sí se puede ver una', async () => {
  await seedRoom();
  await assertFails(getDocs(collection(db('beto'), 'rooms')));
  await assertSucceeds(getDoc(doc(db('beto'), 'rooms', ROOM)));
  await assertFails(getDoc(doc(anon(), 'rooms', ROOM))); // sin sesión, no
});

test('unirse: solo uno mismo, con datos limpios, y no a una sala cerrada', async () => {
  await seedRoom();
  const ok = { name: 'Beto', photo: null, joinedAt: serverTimestamp(), lastMessageAt: null, lastMessageId: null };
  await assertFails(setDoc(doc(db('beto'), 'rooms', ROOM, 'members', 'carla'), ok)); // no puede meter a otro
  await assertFails(setDoc(doc(db('beto'), 'rooms', ROOM, 'members', 'beto'), { ...ok, lastMessageAt: Timestamp.fromMillis(0) })); // no puede adelantarse el límite
  await assertSucceeds(setDoc(doc(db('beto'), 'rooms', ROOM, 'members', 'beto'), ok));

  await env.clearFirestore();
  await seedRoom({ expiresAt: hoursFromNow(-1) });
  await assertFails(setDoc(doc(db('beto'), 'rooms', ROOM, 'members', 'beto'), ok)); // sala cerrada
});

test('chat: un mensaje pasa; el segundo antes de 60 s no', async () => {
  await seedRoom({ members: { beto: {} } });
  const f = db('beto');
  await assertSucceeds(sendBatch(f, 'beto', 'm1'));
  await assertFails(sendBatch(f, 'beto', 'm2'));
});

test('chat: pasados 60 s se puede volver a escribir', async () => {
  await seedRoom({ members: { beto: { lastMessageAt: Timestamp.fromMillis(Date.now() - 61_000), lastMessageId: 'viejo' } } });
  await assertSucceeds(sendBatch(db('beto'), 'beto', 'm3'));
});

test('chat: no se puede saltar el límite (mensaje sin ficha, dos mensajes en un lote, a nombre de otro)', async () => {
  await seedRoom({ members: { beto: {} } });
  const f = db('beto');
  // mensaje solo, sin actualizar "mi último mensaje"
  await assertFails(setDoc(doc(f, 'rooms', ROOM, 'messages', 'x1'), { uid: 'beto', name: 'beto', photo: null, text: 'hola', createdAt: serverTimestamp() }));
  // dos mensajes en el mismo lote
  const b = writeBatch(f);
  b.set(doc(f, 'rooms', ROOM, 'messages', 'x2'), { uid: 'beto', name: 'beto', photo: null, text: 'uno', createdAt: serverTimestamp() });
  b.set(doc(f, 'rooms', ROOM, 'messages', 'x3'), { uid: 'beto', name: 'beto', photo: null, text: 'dos', createdAt: serverTimestamp() });
  b.update(doc(f, 'rooms', ROOM, 'members', 'beto'), { lastMessageAt: serverTimestamp(), lastMessageId: 'x3' });
  await assertFails(b.commit());
  // a nombre de otro usuario
  const c = writeBatch(f);
  c.set(doc(f, 'rooms', ROOM, 'messages', 'x4'), { uid: 'ana', name: 'ana', photo: null, text: 'soy ana', createdAt: serverTimestamp() });
  c.update(doc(f, 'rooms', ROOM, 'members', 'beto'), { lastMessageAt: serverTimestamp(), lastMessageId: 'x4' });
  await assertFails(c.commit());
});

test('chat: máximo 200 caracteres y no vacío', async () => {
  await seedRoom({ members: { beto: {} } });
  await assertFails(sendBatch(db('beto'), 'beto', 'l1', 'a'.repeat(201)));
  await assertFails(sendBatch(db('beto'), 'beto', 'l2', '   '));
});

test('antes de unirse, cada uno puede leer solo su propia ficha (aunque no exista)', async () => {
  await seedRoom();
  await assertSucceeds(getDoc(doc(db('beto'), 'rooms', ROOM, 'members', 'beto')));
  await assertFails(getDoc(doc(db('beto'), 'rooms', ROOM, 'members', 'ana')));
});

test('quien no es miembro no lee ni escribe en el chat', async () => {
  await seedRoom({ members: { beto: {} } });
  await assertSucceeds(sendBatch(db('beto'), 'beto', 'm1'));
  await assertFails(getDocs(collection(db('intruso'), 'rooms', ROOM, 'messages')));
  await assertFails(getDocs(collection(db('intruso'), 'rooms', ROOM, 'members')));
  await assertSucceeds(getDocs(collection(db('beto'), 'rooms', ROOM, 'messages')));
});

test('borrar: el autor su mensaje; el creador de la sala cualquiera; otros no', async () => {
  await seedRoom({ members: { beto: {}, carla: {} } });
  await assertSucceeds(sendBatch(db('beto'), 'beto', 'm1'));
  await assertFails(deleteDoc(doc(db('carla'), 'rooms', ROOM, 'messages', 'm1')));
  await assertSucceeds(deleteDoc(doc(db('ana'), 'rooms', ROOM, 'messages', 'm1')));
  await assertFails(deleteDoc(doc(db('beto'), 'rooms', ROOM)));   // solo el creador borra la sala
  await assertSucceeds(deleteDoc(doc(db('ana'), 'rooms', ROOM)));
});
