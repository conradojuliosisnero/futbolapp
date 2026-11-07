// Competiciones que muestra la app (códigos de football-data.org, plan gratis).
// Para agregar o quitar una liga, edita esta lista. Disponibles en el plan gratis:
// PL, ELC, PD, SA, BL1, FL1, DED, PPL, CL, EC, WC, BSA, CLI.
export const LEAGUES = [
  { code: 'PL', name: 'Premier League', country: 'Inglaterra' },
  { code: 'PD', name: 'LaLiga', country: 'España' },
  { code: 'SA', name: 'Serie A', country: 'Italia' },
  { code: 'BL1', name: 'Bundesliga', country: 'Alemania' },
  { code: 'FL1', name: 'Ligue 1', country: 'Francia' },
  { code: 'CL', name: 'Champions League', country: 'Europa' },
  { code: 'CLI', name: 'Copa Libertadores', country: 'Sudamérica' },
  { code: 'BSA', name: 'Brasileirão', country: 'Brasil' },
];

export const leagueEmblem = (code) => `https://crests.football-data.org/${code}.png`;

// shortcut: equipo de "Mi equipo" fijo hasta que el usuario lo elija con su cuenta (users/{uid}.favoriteTeam).
export const DEFAULT_TEAM = { id: 86, name: 'Real Madrid', league: 'PD' };
