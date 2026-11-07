import { test } from 'node:test';
import assert from 'node:assert/strict';
import { matchNotifications, newsNotifications, wants, eventKey, groupUsersByTeam, usersForMatch } from './engine.mjs';

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
  assert.equal(r1.notifications[0].title, '⚽ ¡GOL de Atl. Nacional! 1-0');
  assert.match(r1.notifications[0].body, /Atl\. Nacional 1–0 Pereira/);

  // Corre otra vez sin cambios: no repite.
  assert.equal(matchNotifications({ ...base, score: [1, 0], events: [g1] }, r1.state).notifications.length, 0);

  // Llega el segundo gol y termina el partido (eventos: más reciente primero).
  const fin = matchNotifications({ ...base, status: 'finished', score: [2, 0], events: [g2, g1] }, r1.state);
  assert.deepEqual(fin.notifications.map((n) => n.pref), ['goals', 'final']);
  assert.match(fin.notifications[0].body, /Asprilla · 70'/);
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


test('agrupa por equipo: "mi equipo" + favoritos, sin repetir usuario', () => {
  const users = [
    { uid: 'a', favoriteTeam: { id: 'col.1-5264', name: 'Atl. Nacional' }, favorites: { 'col.1-5264': { name: 'Atl. Nacional' }, '86': { name: 'Real Madrid' } } },
    { uid: 'b', favorites: { '86': { name: 'Real Madrid' } }, notify: { goals: false } },
    { uid: 'c' },
  ];
  const by = groupUsersByTeam(users);
  assert.deepEqual([...by.keys()].sort(), ['86', 'col.1-5264']);
  assert.deepEqual(by.get('col.1-5264').users.map((u) => u.uid), ['a']); // "a" está una sola vez aunque sea mi equipo y favorito
  assert.deepEqual(by.get('86').users.map((u) => u.uid).sort(), ['a', 'b']);
  assert.deepEqual(by.get('86').users.find((u) => u.uid === 'b').notify, { goals: false });
});

test('partido entre dos favoritos del mismo usuario: se le avisa una sola vez', () => {
  const by = groupUsersByTeam([{ uid: 'a', favorites: { '86': { name: 'Real Madrid' }, '81': { name: 'Barça' } } }, { uid: 'b', favorites: { '81': { name: 'Barça' } } }]);
  const users = usersForMatch(by, { home: { id: 86 }, away: { id: 81 } });
  assert.deepEqual(users.map((u) => u.uid).sort(), ['a', 'b']);
});

test('aspecto: escudo del equipo que marcó, imagen del marcador, matchId para silenciar', () => {
  const m = {
    ...base, score: [0, 1],
    home: { ...base.home, crest: 'https://a.espncdn.com/i/teamlogos/soccer/500/2919.png' },
    away: { ...base.away, crest: 'https://a.espncdn.com/i/teamlogos/soccer/500/5264.png' },
    events: [{ min: "9'", type: 'goal', side: 'away', player: 'Ramírez' }],
  };
  const [n] = matchNotifications(m, { status: 'live', keys: [] }).notifications;
  assert.equal(n.kind, 'goal');
  assert.equal(n.icon, m.away.crest);
  assert.equal(n.matchId, 'col.1-1');
  const img = new URL(n.image, 'https://x');
  assert.equal(img.pathname, '/api/push-image');
  assert.deepEqual([img.searchParams.get('k'), img.searchParams.get('s'), img.searchParams.get('x'), img.searchParams.get('m')], ['goal', '0-1', 'a', "9'"]);
});
