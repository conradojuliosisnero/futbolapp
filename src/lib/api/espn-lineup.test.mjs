import { test } from 'node:test';
import assert from 'node:assert/strict';
import { placeStarters } from './espn-lineup.mjs';

const p = (formationPlace, posName, who) => ({ formationPlace, position: { name: posName }, athlete: { displayName: who } });
// Fila por fila (de izquierda a derecha) como texto, para comparar fácil.
const rows = (placed) => {
  const r = {};
  for (const { p: x, grid } of placed) { const [row, col] = grid.split(':').map(Number); (r[row] ??= [])[col - 1] = x.athlete.displayName; }
  return Object.keys(r).sort((a, b) => a - b).map((k) => r[k].join(' '));
};

test('4-4-2 real (AEK Atenas, ESPN)', () => {
  const xi = [
    p(1, 'Goalkeeper', 'Brignoli'), p(6, 'Center Left Defender', 'Relvas'), p(5, 'Center Right Defender', 'Moukoudi'),
    p(3, 'Left Back', 'Pilios'), p(2, 'Right Back', 'Rota'), p(8, 'Center Left Midfielder', 'Kairinen'),
    p(4, 'Center Right Midfielder', 'Arriaga'), p(11, 'Left Midfielder', 'Majer'), p(7, 'Right Midfielder', 'Koita'),
    p(9, 'Center Left Forward', 'Gacinovic'), p(10, 'Center Right Forward', 'Jovic'),
  ];
  assert.deepEqual(rows(placeStarters(xi, '4-4-2')), [
    'Brignoli',
    'Pilios Relvas Moukoudi Rota',
    'Majer Kairinen Arriaga Koita',
    'Gacinovic Jovic',
  ]);
});

test('4-2-3-1 real (ESPN: medios "Left/Right Midfielder" + media punta)', () => {
  const xi = [
    p(1, 'Goalkeeper', 'GK'), p(6, 'Center Left Defender', 'DCI'), p(5, 'Center Right Defender', 'DCD'),
    p(3, 'Left Back', 'LI'), p(2, 'Right Back', 'LD'), p(10, 'Attacking Midfielder', 'MO'),
    p(4, 'Left Midfielder', 'MCI'), p(8, 'Right Midfielder', 'MCD'), p(9, 'Forward', 'DC'),
    p(11, 'Attacking Midfielder Left', 'MOI'), p(7, 'Attacking Midfielder Right', 'MOD'),
  ];
  assert.deepEqual(rows(placeStarters(xi, '4-2-3-1')), ['GK', 'LI DCI DCD LD', 'MCI MCD', 'MOI MO MOD', 'DC']);
});

test('3-5-2 con volante de contención y extremos de carril', () => {
  const xi = [
    p(1, 'Goalkeeper', 'GK'), p(5, 'Center Defender', 'DC'), p(6, 'Center Left Defender', 'DCI'), p(4, 'Center Right Defender', 'DCD'),
    p(3, 'Left Wing Back', 'CI'), p(2, 'Right Wing Back', 'CD'), p(8, 'Defensive Midfielder', 'MCD'),
    p(7, 'Center Left Midfielder', 'MI'), p(10, 'Center Right Midfielder', 'MD'), p(9, 'Center Left Forward', 'DI'), p(11, 'Center Right Forward', 'DD'),
  ];
  // En 3-5-2 los carrileros ("Wing Back") van en la línea de 5, a los costados.
  assert.deepEqual(rows(placeStarters(xi, '3-5-2')), ['GK', 'DCI DC DCD', 'CI MI MCD MD CD', 'DI DD']);
});

test('5-3-2: los mismos carrileros caen en la línea de 5', () => {
  const xi = [
    p(1, 'Goalkeeper', 'GK'), p(5, 'Center Defender', 'DC'), p(6, 'Center Left Defender', 'DCI'), p(4, 'Center Right Defender', 'DCD'),
    p(3, 'Left Wing Back', 'CI'), p(2, 'Right Wing Back', 'CD'), p(8, 'Defensive Midfielder', 'MCD'),
    p(7, 'Center Left Midfielder', 'MI'), p(10, 'Center Right Midfielder', 'MD'), p(9, 'Center Left Forward', 'DI'), p(11, 'Center Right Forward', 'DD'),
  ];
  assert.deepEqual(rows(placeStarters(xi, '5-3-2')), ['GK', 'CI DCI DC DCD CD', 'MI MCD MD', 'DI DD']);
});

test('sin formación: todos los de campo en una fila, nadie se pierde', () => {
  const xi = [p(1, 'Goalkeeper', 'GK'), p(2, 'Defender', 'A'), p(3, 'Midfielder', 'B'), p(4, 'Forward', 'C')];
  assert.deepEqual(rows(placeStarters(xi, '')), ['GK', 'A B C']);
});
