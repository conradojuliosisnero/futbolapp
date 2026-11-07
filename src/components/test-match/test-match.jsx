'use client';

import { useEffect, useMemo, useReducer, useState } from 'react';
import { Play } from '@/components/animate-ui/icons/play';
import { Pause } from '@/components/animate-ui/icons/pause';
import { RefreshCw } from '@/components/animate-ui/icons/refresh-cw';
import { Flag } from '@/components/animate-ui/icons/flag';
import { Timer } from '@/components/animate-ui/icons/timer';
import { Button } from '@/components/ui/button';
import { VideoPlayer } from '@/components/match/video-player';
import { Scoreboard } from '@/components/match/scoreboard';
import { PredictionBar } from '@/components/match/prediction-bar';
import { MatchTabs } from '@/components/match/match-tabs';
import { cn } from '@/lib/utils';
import { initialState, reducer, toMatch, HOME, AWAY } from './simulator';

const EVENTS = [
  { event: 'goal', label: 'Gol', emoji: '⚽' },
  { event: 'yellow', label: 'Amarilla', emoji: '🟨' },
  { event: 'red', label: 'Roja', emoji: '🟥' },
  { event: 'sub', label: 'Cambio', emoji: '🔁' },
  { event: 'var', label: 'VAR anula', emoji: '📺' },
  { event: 'missed-penalty', label: 'Penal fallado', emoji: '❌' },
];
const SPEEDS = [{ label: '1 s', ms: 1000 }, { label: '0,5 s', ms: 500 }, { label: '0,2 s', ms: 200 }];

/** Aviso del último evento. Es el punto donde se conectarán las animaciones de goles, tarjetas, etc. */
function EventBanner({ event }) {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 3500);
    return () => clearTimeout(t);
  }, []);
  if (!visible) return null;
  const tone = event.type === 'goal' ? 'bg-primary text-primary-foreground'
    : event.type === 'red' ? 'bg-live text-live-foreground'
    : event.type === 'yellow' ? 'bg-warning text-background' : 'bg-card text-foreground ring-1 ring-border';
  return (
    <div role="status" className={cn('pointer-events-none fixed inset-x-4 top-4 z-50 mx-auto max-w-md rounded-2xl px-5 py-3.5 shadow-2xl animate-in fade-in-0 slide-in-from-top-6 zoom-in-95 duration-300', tone)}>
      <p className="text-xs font-bold opacity-80">{event.min}</p>
      <p className="text-base font-black">{event.title}</p>
      {event.text && <p className="text-sm opacity-90">{event.text}</p>}
    </div>
  );
}

function SideControls({ side, team, disabled, fire }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-semibold tracking-wider text-faint uppercase">{team.name}</span>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {EVENTS.map((e) => (
          <Button key={e.event} variant="secondary" disabled={disabled} onClick={() => fire(e.event, side)} className="h-10 justify-start rounded-xl">
            <span aria-hidden>{e.emoji}</span> {e.label}
          </Button>
        ))}
      </div>
    </div>
  );
}

export function TestMatch() {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);
  const [auto, setAuto] = useState(false);
  const [speed, setSpeed] = useState(SPEEDS[0].ms);
  const match = useMemo(() => toMatch(state), [state]);
  const live = state.phase === 'first' || state.phase === 'second';

  // Reloj: cada "minuto" de juego dura `speed` ms. En automático también genera eventos al azar.
  useEffect(() => {
    if (!live || !auto) return;
    const id = setInterval(() => { dispatch({ type: 'tick' }); dispatch({ type: 'random' }); }, speed);
    return () => clearInterval(id);
  }, [live, auto, speed]);

  const fire = (event, side) => dispatch({ type: 'event', event, side });

  return (
    <div className="flex flex-col gap-5">
      {state.lastEvent && <EventBanner key={state.lastEvent.id} event={state.lastEvent} />}

      <div className="flex flex-col gap-1">
        <h1 className="text-[26px] font-black tracking-tight">Partido de prueba</h1>
        <p className="text-sm text-muted-foreground">Simulación local para probar animaciones. No usa las APIs ni se guarda.</p>
      </div>

      <section className="flex flex-col gap-4 rounded-3xl bg-card p-4 md:p-5" aria-label="Controles del partido">
        <div className="flex flex-wrap items-center gap-2">
          {state.phase === 'scheduled' && <Button size="touch" onClick={() => { dispatch({ type: 'start' }); setAuto(true); }}><Play /> Iniciar partido</Button>}
          {live && (
            <Button size="touch" variant="secondary" onClick={() => setAuto(!auto)}>
              {auto ? <><Pause /> Pausar reloj</> : <><Play /> Reanudar reloj</>}
            </Button>
          )}
          {state.phase === 'first' && <Button size="touch" variant="outline" onClick={() => dispatch({ type: 'halftime' })}><Timer /> Medio tiempo</Button>}
          {state.phase === 'half' && <Button size="touch" onClick={() => { dispatch({ type: 'resume' }); setAuto(true); }}><Play /> Segundo tiempo</Button>}
          {(live || state.phase === 'half') && <Button size="touch" variant="outline" onClick={() => dispatch({ type: 'end' })}><Flag /> Final</Button>}
          <Button size="touch" variant="ghost" onClick={() => { dispatch({ type: 'reset' }); setAuto(false); }}><RefreshCw /> Reiniciar</Button>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-faint">1 minuto de juego =</span>
          {SPEEDS.map((s) => (
            <button
              key={s.ms}
              type="button"
              onClick={() => setSpeed(s.ms)}
              aria-pressed={speed === s.ms}
              className={cn('rounded-full px-3 py-1 font-semibold transition-colors', speed === s.ms ? 'bg-primary text-primary-foreground' : 'bg-secondary text-control')}
            >
              {s.label}
            </button>
          ))}
          <span className="ml-auto font-mono text-xs text-faint">{state.events.length} eventos</span>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <SideControls side="home" team={HOME} disabled={!live} fire={fire} />
          <SideControls side="away" team={AWAY} disabled={!live} fire={fire} />
        </div>
      </section>

      <VideoPlayer live={match.status === 'live'} progress={match.progress} />
      <Scoreboard match={match} />
      <PredictionBar match={match} />
      <MatchTabs match={match} />
    </div>
  );
}
