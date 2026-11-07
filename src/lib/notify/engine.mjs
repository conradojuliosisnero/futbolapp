// Decide QUÉ avisar comparando el estado actual de un partido con lo ya avisado. Funciones puras (sin red ni base).

/** Identificador estable de un evento (minuto + tipo + jugador/título). */
export const eventKey = (e) => `${e.min}|${e.type}|${e.player ?? e.title ?? ''}`;

const score = (m) => (m.score ? `${m.home.name} ${m.score[0]}–${m.score[1]} ${m.away.name}` : `${m.home.name} vs ${m.away.name}`);

/**
 * prev: { status, keys: [] } de la corrida anterior (o null si es la primera vez que se ve el partido).
 * Devuelve { notifications, state } — state es lo que hay que guardar para la próxima corrida.
 * Primera vez: no avisa lo que ya pasó (evita una avalancha al activar el sistema), solo lo registra.
 */
export function matchNotifications(match, prev) {
  const events = match.events ?? [];
  const keys = events.map(eventKey);
  const state = { status: match.status, keys };
  if (!prev) return { notifications: [], state };

  const seen = new Set(prev.keys ?? []);
  const url = `/partido/${match.id}`;
  const tag = `m-${match.id}`;
  const out = [];

  if (prev.status === 'scheduled' && match.status === 'live') {
    out.push({ pref: 'kickoff', title: `¡Empezó! ${match.home.name} vs ${match.away.name}`, body: match.league, url, tag });
  }
  // Más antiguos primero, para que lleguen en orden.
  for (const e of [...events].reverse()) {
    if (seen.has(eventKey(e))) continue;
    if (e.type === 'goal') {
      out.push({ pref: 'goals', title: `⚽ ¡GOL! ${score(match)}`, body: `${e.player ?? ''} ${e.min}`.trim(), url, tag });
    } else if (e.type === 'red') {
      out.push({ pref: 'redCards', title: `🟥 Roja en ${match.home.code}–${match.away.code}`, body: `${e.title} · ${e.min}`, url, tag });
    }
  }
  if (prev.status !== 'finished' && match.status === 'finished') {
    out.push({ pref: 'final', title: `Final: ${score(match)}`, body: match.league, url, tag });
  }
  return { notifications: out, state };
}

/**
 * Noticias nuevas de un equipo. prevUrls: urls ya vistas (null = primera vez → solo registra).
 * Avisa como máximo `max` notas por corrida para no saturar.
 */
export function newsNotifications(team, articles, prevUrls, max = 2) {
  const urls = articles.map((a) => a.url);
  const state = { urls: urls.slice(0, 50) };
  if (!prevUrls) return { notifications: [], state };
  const seen = new Set(prevUrls);
  const fresh = articles.filter((a) => !seen.has(a.url)).slice(0, max);
  return {
    notifications: fresh.map((a) => ({ pref: 'teamNews', title: `📰 ${team.name}`, body: a.headline, url: a.url, tag: `n-${team.id}` })),
    state: { urls: [...new Set([...urls, ...prevUrls])].slice(0, 50) },
  };
}

const DEFAULT_PREFS = { goals: true, kickoff: true, final: true, redCards: false, reminders: true, teamNews: true };

/** ¿El usuario quiere este tipo de aviso? (si nunca guardó preferencias, se usan las de por defecto) */
export const wants = (notify, pref) => ({ ...DEFAULT_PREFS, ...(notify ?? {}) })[pref] !== false;

/**
 * Agrupa usuarios por equipo seguido ("mi equipo" + favoritos), sin repetir usuario dentro de un equipo.
 * users: [{ uid, favoriteTeam, favorites: { [teamId]: { name, crest, league } }, notify }]
 * → Map teamId → { team: { id, name, crest, league }, users: [{ uid, notify }] }
 */
export function groupUsersByTeam(users) {
  const byTeam = new Map();
  const add = (id, info, u) => {
    const key = String(id);
    if (!byTeam.has(key)) byTeam.set(key, { team: { id: key, name: info.name, crest: info.crest ?? null, league: info.league ?? null }, users: new Map() });
    byTeam.get(key).users.set(u.uid, { uid: u.uid, notify: u.notify });
  };
  for (const u of users) {
    if (u.favoriteTeam?.id) add(u.favoriteTeam.id, u.favoriteTeam, u);
    for (const [id, info] of Object.entries(u.favorites ?? {})) if (info?.name) add(id, info, u);
  }
  return new Map([...byTeam].map(([k, v]) => [k, { team: v.team, users: [...v.users.values()] }]));
}

/** Usuarios a avisar de un partido: los de ambos equipos, sin duplicar a quien sigue a los dos. */
export function usersForMatch(byTeam, match) {
  const all = new Map();
  for (const id of [match.home.id, match.away.id]) for (const u of byTeam.get(String(id))?.users ?? []) all.set(u.uid, u);
  return [...all.values()];
}
