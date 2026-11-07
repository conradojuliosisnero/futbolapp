import { test } from 'node:test';
import assert from 'node:assert/strict';
import { matchNotifications, newsNotifications, wants, eventKey } from './engine.mjs';

const base = {
  id: 'col.1-1', league: 'Liga BetPlay', status: 'live',
  home: { name: 'Atl. Nacional', code: 'NAL' }, away: { name: 'Pereira', code: 'PER' },
};
const goal = (min, player) => ({ min, type: 'goal', player, title: '¡GOL!' });

test('primera vez que se ve el partido: no avisa nada, solo registra', () => {
  const m = { ...base, score: [1, 0], events: [goal("12'", 'Morelos')] };
  const { notifications, state } = matchNotifications(m, null);
  assert.equal(notifications.length, 0);
  assert.deepEqual(state.keys, [eventKey(m.events[0])]);
});

test('avisa inicio, solo los goles nuevos y el final', () => {
  const start = matchNotifications({ ...base, score: [0, 0], events: [] }, { status: 'scheduled', keys: [] });
  assert.deepEqual(start.notifications.map((n) => n.pref), ['kickoff']);

  const g1 = goal("12'", 'Morelos'), g2 = goal("70'", 'Asprilla');
  const r1 = matchNotifications({ ...base, score: [1, 0], events: [g1] }, start.state);
  assert.equal(r1.notifications.length, 1);
  assert.match(r1.notifications[0].title, /GOL! Atl\. Nacional 1–0 Pereira/);

  // Corre otra vez sin cambios: no repite.
  assert.equal(matchNotifications({ ...base, score: [1, 0], events: [g1] }, r1.state).notifications.length, 0);

  // Llega el segundo gol y termina el partido (eventos: más reciente primero).
  const fin = matchNotifications({ ...base, status: 'finished', score: [2, 0], events: [g2, g1] }, r1.state);
  assert.deepEqual(fin.notifications.map((n) => n.pref), ['goals', 'final']);
  assert.match(fin.notifications[0].body, /Asprilla 70'/);
});

test('roja avisa con su preferencia; amarilla no avisa', () => {
  const ev = [{ min: "30'", type: 'red', title: 'Roja · X (PER)' }, { min: "20'", type: 'yellow', title: 'Amarilla · Y' }];
  const r = matchNotifications({ ...base, score: [0, 0], events: ev }, { status: 'live', keys: [] });
  assert.deepEqual(r.notifications.map((n) => n.pref), ['redCards']);
});

test('noticias: primera vez registra; luego avisa máximo 2 nuevas', () => {
  const team = { id: 'col.1-5264', name: 'Atl. Nacional' };
  const a = (n) => ({ url: `https://espn/${n}`, headline: `Nota ${n}` });
  const first = newsNotifications(team, [a(1), a(2)], null);
  assert.equal(first.notifications.length, 0);
  const next = newsNotifications(team, [a(5), a(4), a(3), a(1), a(2)], first.state.urls);
  assert.deepEqual(next.notifications.map((n) => n.body), ['Nota 5', 'Nota 4']);
  assert.ok(next.state.urls.includes('https://espn/1'));
});

test('preferencias: por defecto sí (menos rojas); lo que el usuario apaga, no', () => {
  assert.equal(wants(undefined, 'goals'), true);
  assert.equal(wants(undefined, 'redCards'), false);
  assert.equal(wants({ goals: false }, 'goals'), false);
  assert.equal(wants({ teamNews: true }, 'teamNews'), true);
});
