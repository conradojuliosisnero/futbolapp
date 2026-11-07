// Puntos y racha diaria (lógica pura: la usan el servidor y la app, y se prueba en rules.test.mjs).
// Los puntos solo los da el servidor (firebase-admin); la app solo los muestra.
//
// users/{uid}.game = { points, streak, best, last: 'YYYY-MM-DD', day: 'YYYY-MM-DD', today: puntos de hoy, news: notas leídas hoy }

export const POINTS = {
  day: 10,     // entrar al app (una vez por día)
  week: 50,    // bono cada 7 días seguidos de racha
  news: 3,     // leer una noticia
  vote: 5,     // votar quién gana un partido
  correct: 20, // bono si acertaste
};
export const NEWS_PER_DAY = 5; // noticias que suman por día
export const TOP = 50;         // tamaño del ranking

const TZ = 'America/Bogota'; // el día cambia a medianoche de Colombia
export const dayKey = (t = Date.now()) => new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(t);
const prevDay = (day) => {
  const d = new Date(`${day}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
};

/** Racha vigente: si la última visita no fue hoy ni ayer, ya se perdió. */
export function currentStreak(game, today = dayKey()) {
  if (!game?.last) return 0;
  return game.last === today || game.last === prevDay(today) ? game.streak ?? 0 : 0;
}

/** Contadores del día (se reinician solos al cambiar de día). */
export const todayOf = (game, today = dayKey()) => (game?.day === today ? { today: game.today ?? 0, news: game.news ?? 0 } : { today: 0, news: 0 });

/** Suma puntos al juego. Devuelve el juego nuevo. */
export function addPoints(game = {}, points, today = dayKey(), extra = {}) {
  const t = todayOf(game, today);
  return { ...game, points: (game.points ?? 0) + points, day: today, today: t.today + points, news: t.news, ...extra };
}

/** Visita del día: sigue o reinicia la racha y da el bono de cada 7 días. null si ya se contó hoy. */
export function checkin(game = {}, today = dayKey()) {
  if (game.last === today) return null;
  const streak = game.last === prevDay(today) ? (game.streak ?? 0) + 1 : 1;
  const added = POINTS.day + (streak % 7 === 0 ? POINTS.week : 0);
  return { added, game: addPoints(game, added, today, { streak, best: Math.max(game.best ?? 0, streak), last: today }) };
}

/** Noticia leída. null si ya llegó al tope del día. */
export function readNews(game = {}, today = dayKey()) {
  const t = todayOf(game, today);
  if (t.news >= NEWS_PER_DAY) return null;
  return { added: POINTS.news, game: { ...addPoints(game, POINTS.news, today), news: t.news + 1 } };
}

/** Resultado del partido como voto: 'home' | 'draw' | 'away' (null si no hay marcador). */
export function winnerPick(score) {
  if (!Array.isArray(score) || score.length < 2) return null;
  const [h, a] = score.map(Number);
  if (!Number.isFinite(h) || !Number.isFinite(a)) return null;
  return h > a ? 'home' : h < a ? 'away' : 'draw';
}
