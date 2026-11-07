import { test } from 'node:test';
import assert from 'node:assert/strict';
import { playToToast, newPlayToasts } from './play-toasts.mjs';

const foul = { id: '1', min: "8'", kind: 'foul', team: 'Tottenham', text: 'Falta de Tonali.' };
const off = { id: '2', min: "12'", kind: 'offside', team: 'Leeds', text: 'Fuera de lugar.' };
const goal = { id: '3', min: "20'", kind: 'goal', team: 'Leeds', text: 'Gol.' };

test('falta y fuera de lugar se avisan; el gol no (ya tiene animación)', () => {
  assert.equal(playToToast(foul).title, 'Falta · Tottenham');
  assert.equal(playToToast(off).icon, '🚩');
  assert.equal(playToToast(goal), null);
  assert.equal(playToToast({ id: '4', kind: 'penalty---scored' }), null);
  assert.equal(playToToast({ id: '5', kind: 'penalty---saved' }).tone, 'warn');
});

test('solo las jugadas nuevas, en orden cronológico y con tope', () => {
  // relato del más reciente al más antiguo
  const first = newPlayToasts([off, foul], new Set());
  assert.deepEqual(first.toasts.map((t) => t.id), ['play-1', 'play-2']);
  const again = newPlayToasts([goal, off, foul], first.seen);
  assert.equal(again.toasts.length, 0);
  const many = Array.from({ length: 6 }, (_, i) => ({ ...foul, id: `f${i}` })).reverse();
  assert.equal(newPlayToasts(many, new Set(), 3).toasts.at(-1).id, 'play-f5');
});
