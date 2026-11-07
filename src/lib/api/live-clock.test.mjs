import { test } from 'node:test';
import assert from 'node:assert/strict';
import { liveMinute, parseClock } from './live-clock.mjs';

const at = 1_000_000;
const min = (n) => n * 60_000;

test('lee el minuto de ESPN', () => {
  assert.deepEqual(parseClock("40'"), { base: 40, extra: 0 });
  assert.deepEqual(parseClock("45'+2'"), { base: 45, extra: 2 });
  assert.equal(parseClock('MT'), null);
});

test('avanza con el tiempo desde la consulta', () => {
  const c = { minute: "37'", seconds: 36 * 60 + 30, period: 1, at };
  assert.equal(liveMinute(c, at), "37'");
  assert.equal(liveMinute(c, at + 31_000), "38'"); // ya iban 30 s del minuto 37
  assert.equal(liveMinute(c, at + min(3)), "40'");
});

test('pasa a la reposición al final de cada tiempo', () => {
  assert.equal(liveMinute({ minute: "44'", seconds: 43 * 60, period: 1, at }, at + min(3)), "45'+2'");
  assert.equal(liveMinute({ minute: "45'+1'", seconds: 2700, period: 1, at }, at + min(2)), "45'+3'");
  assert.equal(liveMinute({ minute: "89'", seconds: 88 * 60, period: 2, at }, at + min(2)), "90'+1'");
});

test('no inventa más de 5 minutos si los datos se atrasan; sin datos devuelve lo que había', () => {
  assert.equal(liveMinute({ minute: "20'", seconds: 19 * 60, period: 1, at }, at + min(30)), "25'");
  assert.equal(liveMinute({ minute: 'MT', period: 1, at }, at + min(3)), 'MT');
  assert.equal(liveMinute({ minute: "20'" }, at), "20'");
});
