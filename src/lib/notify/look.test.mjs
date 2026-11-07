import { test } from 'node:test';
import assert from 'node:assert/strict';
import { safeCrest, notifIcon } from './look.mjs';

test('solo escudos de hosts conocidos (la imagen la genera nuestro servidor)', () => {
  assert.equal(safeCrest('https://crests.football-data.org/86.png'), 'https://crests.football-data.org/86.png');
  assert.equal(safeCrest('https://evil.example/x.png'), null);
  assert.equal(safeCrest('http://a.espncdn.com/x.png'), null);
  assert.equal(safeCrest('no es url'), null);
});

test('ícono: escudo PNG o el de la app (el sistema no dibuja SVG)', () => {
  assert.equal(notifIcon('https://a.espncdn.com/i/teamlogos/soccer/500/86.png'), 'https://a.espncdn.com/i/teamlogos/soccer/500/86.png');
  assert.equal(notifIcon('https://crests.football-data.org/86.svg'), '/pwa-icon/192');
  assert.equal(notifIcon(null), '/pwa-icon/192');
});
