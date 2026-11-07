'use client';

import { useEffect, useRef } from 'react';
import { useMoments } from './moments-provider';
import { eventToMoment, eventKey, scoreTimeline, fullTimeMoment } from '@/lib/moments/map-event.mjs';

/**
 * Dispara la animación de cada evento NUEVO del partido (y la del final cuando termina).
 * Se vuelve a renderizar con el partido actualizado (la página se refresca sola en vivo).
 * Lo que ya pasó al abrir la página no se anima.
 */
export function LiveMoments({ match }) {
  const { play } = useMoments();
  const seen = useRef(null);
  const status = useRef(null);

  useEffect(() => {
    const events = match?.events ?? [];
    if (seen.current === null) {
      seen.current = new Set(events.map(eventKey));
      status.current = match?.status;
      return;
    }
    const timeline = scoreTimeline(events);
    // events viene del más reciente al más antiguo: se reproduce en orden cronológico
    for (const e of events.filter((x) => !seen.current.has(eventKey(x))).reverse()) {
      seen.current.add(eventKey(e));
      const m = eventToMoment(e, match, timeline);
      if (m) play(m.type, m.data, { priority: m.type === 'lastMinuteGoal' });
    }
    if (status.current !== 'finished' && match?.status === 'finished') {
      const m = fullTimeMoment(match);
      play(m.type, m.data);
    }
    status.current = match?.status;
  }, [match, play]);

  return null;
}
