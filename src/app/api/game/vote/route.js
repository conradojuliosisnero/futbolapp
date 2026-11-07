import { FieldValue } from 'firebase-admin/firestore';
import { gameContext } from '@/lib/game/route-helpers';
import { awardVote } from '@/lib/game/award';
import { getMatch } from '@/lib/api/matches';

// Voto de quién gana. Lo guarda el servidor (así no se puede votar ni cambiar el voto con el partido empezado).
// predictions/{matchId}            { matchId, utc, settled } → la tarea programada da el bono a los que acertaron
// predictions/{matchId}/votes/{uid} { pick, at }
const PICKS = ['home', 'draw', 'away'];

export async function POST(request) {
  const { db, user, error } = await gameContext(request);
  if (error) return error;
  const { matchId, pick } = (await request.json().catch(() => null)) ?? {};
  if (!PICKS.includes(pick) || typeof matchId !== 'string' || matchId.length > 60) {
    return Response.json({ error: 'Voto inválido.' }, { status: 400 });
  }
  const match = await getMatch(matchId).catch(() => null);
  if (!match) return Response.json({ error: 'Partido no encontrado.' }, { status: 404 });
  if (match.status !== 'scheduled' || match.utc <= Date.now()) {
    return Response.json({ error: 'Las votaciones cerraron: el partido ya empezó.' }, { status: 409 });
  }

  const ref = db.collection('predictions').doc(matchId);
  const batch = db.batch();
  batch.set(ref, { matchId, utc: match.utc, settled: false }, { merge: true });
  batch.set(ref.collection('votes').doc(user.uid), { pick, at: FieldValue.serverTimestamp() });
  await batch.commit();
  const { added } = await awardVote(db, user.uid, matchId);
  return Response.json({ added });
}
