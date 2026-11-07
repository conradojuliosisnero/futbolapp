import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkin, readNews, currentStreak, winnerPick, todayOf, POINTS, NEWS_PER_DAY } from './rules.mjs';

test('primera visita: racha 1 y puntos del día', () => {
  const r = checkin({}, '2026-11-07');
  assert.equal(r.added, POINTS.day);
  assert.deepEqual([r.game.streak, r.game.best, r.game.last, r.game.points, r.game.today], [1, 1, '2026-11-07', POINTS.day, POINTS.day]);
});

test('segunda visita el mismo día no suma', () => {
  const { game } = checkin({}, '2026-11-07');
  assert.equal(checkin(game, '2026-11-07'), null);
});

test('día seguido sube la racha; saltarse un día la reinicia', () => {
  const a = checkin({}, '2026-11-07').game;
  const b = checkin(a, '2026-11-08').game;
  assert.equal(b.streak, 2);
  const c = checkin(b, '2026-11-10').game;
  assert.equal(c.streak, 1);
  assert.equal(c.best, 2);
});

test('el séptimo día seguido da el bono semanal (también al cambiar de mes)', () => {
  let g = { streak: 6, best: 6, last: '2026-10-31', points: 0 };
  const r = checkin(g, '2026-11-01');
  assert.equal(r.game.streak, 7);
  assert.equal(r.added, POINTS.day + POINTS.week);
});

test('racha vigente: se pierde si la última visita fue antes de ayer', () => {
  assert.equal(currentStreak({ streak: 4, last: '2026-11-06' }, '2026-11-07'), 4);
  assert.equal(currentStreak({ streak: 4, last: '2026-11-05' }, '2026-11-07'), 0);
  assert.equal(currentStreak(null), 0);
});

test('noticias: suman hasta el tope diario y se reinician al otro día', () => {
  let g = {};
  for (let i = 0; i < NEWS_PER_DAY; i++) g = readNews(g, '2026-11-07').game;
  assert.equal(g.points, NEWS_PER_DAY * POINTS.news);
  assert.equal(readNews(g, '2026-11-07'), null);
  const next = readNews(g, '2026-11-08');
  assert.equal(next.game.news, 1);
  assert.equal(todayOf(next.game, '2026-11-08').today, POINTS.news);
});

test('ganador según el marcador', () => {
  assert.equal(winnerPick([2, 1]), 'home');
  assert.equal(winnerPick([0, 3]), 'away');
  assert.equal(winnerPick([1, 1]), 'draw');
  assert.equal(winnerPick(undefined), null);
});
