import { test } from 'node:test';
import assert from 'node:assert/strict';
import { eventToMoment, isLateGoal, scoreTimeline, pendingMoments } from './map-event.mjs';

const match = (events) => ({ home: { name: 'Atl. Nacional', code: 'NAL' }, away: { name: 'Pereira', code: 'PER' }, score: [2, 1], events });

test('marcador antes y después de cada gol (eventos del más reciente al más antiguo)', () => {
  const g1 = { min: "10'", type: 'goal', side: 'home', player: 'A' };
  const g2 = { min: "30'", type: 'goal', side: 'away', player: 'B' };
  const g3 = { min: "80'", type: 'goal', side: 'home', player: 'C' };
  const t = scoreTimeline([g3, g2, g1]);
  const m = eventToMoment(g3, match([g3, g2, g1]), t);
  assert.equal(m.type, 'goal');
  assert.deepEqual(m.data.prevScore, [1, 1]);
  assert.deepEqual(m.data.score, [2, 1]);
  assert.equal(m.data.team, 'Atl. Nacional');
});

test('gol desde el 88 y en el descuento = gol de último minuto', () => {
  assert.equal(isLateGoal("88'"), true);
  assert.equal(isLateGoal("90'+3'"), true);
  assert.equal(isLateGoal("45'+2'"), false);
  const g = { min: "90'+4'", type: 'goal', side: 'away', player: 'X' };
  assert.equal(eventToMoment(g, match([g])).type, 'lastMinuteGoal');
});

test('roja a quien ya tenía amarilla = doble amarilla; roja directa = roja', () => {
  const y = { min: "20'", type: 'yellow', side: 'away', player: 'Pérez' };
  const r = { min: "70'", type: 'red', side: 'away', player: 'Pérez' };
  assert.equal(eventToMoment(r, match([r, y])).type, 'secondYellow');
  const r2 = { min: "75'", type: 'red', side: 'home', player: 'Gómez' };
  assert.equal(eventToMoment(r2, match([r2, y])).type, 'red');
});

test('cambios e info no se animan', () => {
  assert.equal(eventToMoment({ type: 'sub', min: "60'" }, match([])), null);
  assert.equal(eventToMoment({ type: 'info', min: '' }, match([])), null);
});



test('al entrar: todos los eventos animables en orden cronológico, y el final si terminó', () => {
  const g1 = { min: "10'", type: 'goal', side: 'home', player: 'A' };
  const y = { min: "20'", type: 'yellow', side: 'away', player: 'B' };
  const sub = { min: "60'", type: 'sub', side: 'home', title: 'Cambio' };
  const g2 = { min: "89'", type: 'goal', side: 'away', player: 'C' };
  const m = { ...match([g2, sub, y, g1]), status: 'finished', score: [1, 1] };
  const { moments, keys } = pendingMoments(m);
  assert.deepEqual(moments.map((x) => x.type), ['goal', 'yellow', 'lastMinuteGoal', 'fullTime']);
  // Volver a entrar en la misma sesión: nada nuevo que mostrar.
  assert.equal(pendingMoments(m, keys).moments.length, 0);
});

test('en vivo: solo lo nuevo desde la última vez', () => {
  const g1 = { min: "10'", type: 'goal', side: 'home', player: 'A' };
  const first = pendingMoments({ ...match([g1]), status: 'live' });
  const r = { min: "50'", type: 'red', side: 'away', player: 'Z' };
  const next = pendingMoments({ ...match([r, g1]), status: 'live' }, first.keys);
  assert.deepEqual(next.moments.map((x) => x.type), ['red']);
});
