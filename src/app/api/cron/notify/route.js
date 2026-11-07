import { timingSafeEqual } from 'node:crypto';
import { adminDb } from '@/lib/firebase/admin';
import { matchNotifications, newsNotifications, groupUsersByTeam, usersForMatch } from '@/lib/notify/engine.mjs';
import { deliver } from '@/lib/notify/send';
import { getMatchesByStatus, getMatch, getTeamNews } from '@/lib/api/matches';
import { settlePredictions } from '@/lib/game/settle';

// Tarea programada (cada ~5 min desde GitHub Actions, ver .github/workflows/notify.yml):
// detecta goles, rojas, inicio y final de los partidos de los equipos favoritos de cada usuario (y "mi equipo"),
// y noticias nuevas de esos equipos. También da el bono de puntos a quien acertó el ganador.
// Lo ya avisado se guarda en Firestore (notifyState/*) para no repetir.
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

function authorized(request) {
  const secret = process.env.CRON_SECRET;
  const got = request.headers.get('authorization') ?? '';
  const want = `Bearer ${secret}`;
  return Boolean(secret) && got.length === want.length && timingSafeEqual(Buffer.from(got), Buffer.from(want));
}

export async function GET(request) {
  if (!authorized(request)) return Response.json({ error: 'No autorizado' }, { status: 401 });
  const db = adminDb();
  if (!db) return Response.json({ error: 'Falta FIREBASE_SERVICE_ACCOUNT en el servidor.' }, { status: 503 });

  // 1) Usuarios agrupados por equipo seguido ("mi equipo" + favoritos).
  // shortcut: lee todos los usuarios en cada corrida; con muchos miles, guardar un índice equipo → usuarios.
  const snap = await db.collection('users').get();
  const byTeam = groupUsersByTeam(snap.docs.map((d) => ({ uid: d.id, ...d.data() })));
  const summary = { users: snap.size, teams: byTeam.size, matches: 0, news: 0, pushes: 0, correctPicks: 0 };

  // 0) Bono a los que acertaron quién ganaba (partidos ya terminados).
  summary.correctPicks = await settlePredictions(db).catch((e) => { console.warn('settlePredictions', e.message); return 0; });
  if (!byTeam.size) return Response.json(summary);

  const stateRef = (id) => db.collection('notifyState').doc(id.replace(/\//g, '_'));

  // 2) Partidos en vivo o recién terminados de esos equipos.
  const { live, finished, scheduled } = await getMatchesByStatus();
  const recent = (groups) => groups.flatMap((g) => g.matches);
  const now = Date.now();
  const candidates = [
    ...recent(live),
    ...recent(finished).filter((m) => now - m.utc < 4 * 3600_000), // para avisar el final
    ...recent(scheduled).filter((m) => m.utc - now < 15 * 60_000 && m.utc - now > -3 * 3600_000), // por empezar
  ].filter((m) => byTeam.has(String(m.home.id)) || byTeam.has(String(m.away.id)));

  for (const basic of candidates) {
    const match = basic.status === 'scheduled' ? basic : (await getMatch(basic.id, { details: true })) ?? basic;
    const ref = stateRef(`m-${match.id}`);
    const prev = (await ref.get()).data() ?? null;
    const { notifications, state } = matchNotifications(match, prev);
    const users = usersForMatch(byTeam, match);
    for (const n of notifications) summary.pushes += await deliver(db, users, n);
    await ref.set({ ...state, updatedAt: now });
    summary.matches++;
  }

  // 3) Noticias nuevas de cada equipo.
  for (const { team, users } of byTeam.values()) {
    const articles = await getTeamNews(team.name, team.league).catch(() => []);
    if (!articles.length) continue;
    const ref = stateRef(`n-${team.id}`);
    const prev = (await ref.get()).data()?.urls ?? null;
    const { notifications, state } = newsNotifications(team, articles, prev);
    for (const n of notifications) summary.pushes += await deliver(db, users, n);
    await ref.set({ ...state, updatedAt: now });
    summary.news += notifications.length;
  }

  return Response.json(summary);
}
