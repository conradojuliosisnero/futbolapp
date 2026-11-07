import { test } from 'node:test';
import assert from 'node:assert/strict';
import { initialState, reducer, toMatch } from './simulator.js';

const seq = (vals) => { let i = 0; return () => vals[i++ % vals.length]; };

test('ciclo completo: inicio, gol, medio tiempo automático, final', () => {
  let s = reducer(initialState(), { type: 'start' });
  assert.equal(s.phase, 'first');
  s = reducer(s, { type: 'event', event: 'goal', side: 'home', rnd: seq([0]) });
  assert.deepEqual(s.score, [1, 0]);
  assert.equal(s.lastEvent.type, 'goal');
  for (let i = 0; i < 50; i++) s = reducer(s, { type: 'tick', rnd: seq([0.5]) });
  assert.equal(s.phase, 'half');
  assert.equal(toMatch(s).minute, 'MT');
  s = reducer(s, { type: 'resume' });
  for (let i = 0; i < 50; i++) s = reducer(s, { type: 'tick', rnd: seq([0.5]) });
  assert.equal(s.phase, 'finished');
  assert.equal(toMatch(s).status, 'finished');
});

test('no hay eventos fuera de juego (antes de empezar o en el entretiempo)', () => {
  const s = reducer(initialState(), { type: 'event', event: 'goal', side: 'away' });
  assert.deepEqual(s.score, [0, 0]);
  assert.equal(s.events.length, 0);
});
