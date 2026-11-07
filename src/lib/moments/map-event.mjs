// Traduce los eventos del partido (formato de la app: ESPN / API-Football / simulador) a "momentos" animados.

const parseMinute = (min) => {
  const [base, extra] = String(min ?? '').replace(/'/g, '').split('+').map((n) => parseInt(n, 10) || 0);
  return { base, extra };
};

/** Gol "agónico": desde el 88' o en el descuento del segundo tiempo. */
export const isLateGoal = (min) => parseMinute(min).base >= 88;

export const eventKey = (e) => e.id ?? `${e.min}|${e.type}|${e.player ?? e.title ?? ''}`;

/**
 * Marcador antes y después de cada gol, recorriendo los eventos en orden cronológico.
 * events viene del más reciente al más antiguo (así los muestra la app).
 */
export function scoreTimeline(events) {
  const byKey = new Map();
  const score = [0, 0];
  for (const e of [...events].reverse()) {
    if (e.type !== 'goal') continue;
    const prev = [...score];
    score[e.side === 'away' ? 1 : 0] += 1;
    byKey.set(eventKey(e), { prev, score: [...score] });
  }
  return byKey;
}

/** Un evento → { type, data } para el motor, o null si ese evento no se anima (cambios, info). */
export function eventToMoment(ev, match, timeline = scoreTimeline(match.events ?? [])) {
  const H = match.home, A = match.away;
  const side = ev.side === 'away' ? 'away' : 'home';
  const team = side === 'home' ? H : A;
  switch (ev.type) {
    case 'goal': {
      const late = isLateGoal(ev.min);
      const s = timeline.get(eventKey(ev));
      return {
        type: late ? 'lastMinuteGoal' : 'goal',
        data: {
          team: team.name, scorer: ev.player || team.name, minute: ev.min, home: H.code, away: A.code,
          score: s?.score ?? match.score, prevScore: s?.prev, side,
          headline: late ? '¡En el último minuto!' : undefined,
        },
      };
    }
    case 'yellow':
      return { type: 'yellow', data: { player: ev.player ?? ev.title, team: team.name, minute: ev.min } };
    case 'red': {
      // Roja a quien ya tenía amarilla en este partido = doble amarilla.
      const second = (match.events ?? []).some((x) => x.type === 'yellow' && x.side === ev.side && x.player && x.player === ev.player);
      return second
        ? { type: 'secondYellow', data: { player: ev.player, team: team.name, minute: ev.min, note: 'Juega con 10' } }
        : { type: 'red', data: { player: ev.player ?? ev.title, team: team.name, minute: ev.min, note: 'Expulsado' } };
    }
    case 'var':
      return { type: 'var', data: { reason: ev.title?.replace(/^VAR · /, ''), decision: ev.text, minute: ev.min } };
    default:
      return null;
  }
}

/** Momento de final de partido. */
export const fullTimeMoment = (match) => ({ type: 'fullTime', data: { home: match.home.name, away: match.away.name, score: match.score ?? [0, 0] } });
