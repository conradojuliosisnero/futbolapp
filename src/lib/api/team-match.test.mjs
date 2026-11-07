import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sameTeam } from './team-match.mjs';

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
