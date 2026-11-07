import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sameTeam, bestTeamMatch, searchTerm } from './team-match.mjs';

test('elige el equipo correcto entre resultados de búsqueda', () => {
  const madrid = [
    { id: 530, name: 'Atletico Madrid', country: 'Spain' },
    { id: 541, name: 'Real Madrid', country: 'Spain' },
    { id: 7926, name: 'Real Madrid U19', country: 'Spain' },
    { id: 15224, name: 'Real Madrid W', country: 'Spain' },
  ];
  assert.equal(bestTeamMatch('Real Madrid CF', madrid, 'Spain').id, 541);
  assert.equal(bestTeamMatch('Club Atlético de Madrid', madrid, 'Spain').id, 530);
  assert.equal(bestTeamMatch('Real Madrid CF', madrid, 'Italy'), null);
  assert.equal(searchTerm('Real Madrid CF'), 'madrid');
  assert.equal(searchTerm('FC Barcelona'), 'barcelona');
});

test('empareja nombres del mismo equipo entre proveedores', () => {
  assert.ok(sameTeam('Borussia Dortmund', 'Dortmund'));
  assert.ok(sameTeam('FC Bayern München', 'Bayern Munich'));
  assert.ok(sameTeam('SV 07 Elversberg', 'SV Elversberg'));
  assert.ok(sameTeam('Wolverhampton Wanderers FC', 'Wolves') === false); // apodos: no se adivinan
  assert.ok(sameTeam('Atlético de Madrid', 'Atletico Madrid'));
  assert.ok(sameTeam('Inter', 'Inter'));
});

test('no empareja equipos distintos de la misma ciudad por palabras genéricas', () => {
  assert.equal(sameTeam('Real Madrid CF', 'Real Sociedad'), false);
  assert.equal(sameTeam('Manchester City FC', 'Manchester United FC'), true); // comparten "manchester": por eso se exige local Y visitante
});
