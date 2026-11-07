import 'server-only';
import { awardCorrect } from './award';
import { winnerPick } from './rules.mjs';
import { getMatch } from '@/lib/api/matches';

const HOUR = 3600_000;

/**
 * Bono para los que acertaron: revisa los partidos con votos que ya debieron terminar.
 * Lo llama la tarea programada (/api/cron/notify). Devuelve cuántos aciertos premió.
 */
export async function settlePredictions(db, { max = 15 } = {}) {
  const now = Date.now();
  // Partidos que empezaron hace más de 2 h (un partido dura ~2 h con el descanso).
  const snap = await db.collection('predictions').where('settled', '==', false).where('utc', '<', now - 2 * HOUR).limit(max).get();
  let winners = 0;
  for (const doc of snap.docs) {
    const { matchId, utc } = doc.data();
    const match = await getMatch(matchId).catch(() => null);
    if (match?.status !== 'finished') {
      // Aplazado, cancelado o sin datos: se deja de esperar a los 2 días.
      if (now - utc > 48 * HOUR) await doc.ref.update({ settled: true, result: null });
      continue;
    }
    const pick = winnerPick(match.score);
    if (pick) {
      const votes = await doc.ref.collection('votes').where('pick', '==', pick).get();
      for (const v of votes.docs) winners += (await awardCorrect(db, v.id, matchId)).added ? 1 : 0;
    }
    await doc.ref.update({ settled: true, result: pick });
  }
  return winners;
}
