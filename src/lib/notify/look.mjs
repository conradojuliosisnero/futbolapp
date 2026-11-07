// Aspecto de las notificaciones push (lógica pura, probada en look.test.mjs).
// Ícono = escudo del equipo (si es PNG de un host conocido) · imagen grande = /api/push-image (marcador al estilo de la app).

const CREST_HOSTS = ['crests.football-data.org', 'a.espncdn.com', 'media.api-sports.io'];

/** Escudo apto para la notificación y para la imagen: solo hosts conocidos (la imagen la genera nuestro servidor). */
export function safeCrest(url) {
  try {
    const u = new URL(url);
    return u.protocol === 'https:' && CREST_HOSTS.includes(u.hostname) ? u.href : null;
  } catch { return null; }
}

/** Ícono de la notificación: el sistema no dibuja SVG, así que solo PNG; si no, el de la app. */
export const notifIcon = (crest) => (safeCrest(crest) && !/\.svg($|\?)/i.test(crest) ? crest : '/pwa-icon/192');

const short = (s, n) => String(s ?? '').slice(0, n);

/**
 * URL de la imagen grande (marcador). kind: goal | red | kickoff | final.
 * Todo va en la URL (sin consultar APIs al generarla); el servidor valida y recorta cada valor.
 */
export function pushImageUrl({ kind, match, minute, highlight }) {
  const p = new URLSearchParams({
    k: kind,
    h: short(match.home.name, 30), a: short(match.away.name, 30),
    hc: safeCrest(match.home.crest) ?? '', ac: safeCrest(match.away.crest) ?? '',
    s: match.score ? `${match.score[0]}-${match.score[1]}` : '',
    m: short(minute ?? '', 10), l: short(match.league, 40), x: highlight ?? '',
  });
  return `/api/push-image?${p}`;
}
