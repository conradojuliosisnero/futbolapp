// Competiciones que muestra la app, en el orden en que aparecen.
//  - Sin `source`: datos de football-data.org (plan gratis). `espn` = misma liga en ESPN (minuto real, relato, alineaciones).
//  - source: 'espn': la liga solo existe en ESPN (API no oficial, sin clave).
// Para agregar o quitar una liga, edita esta lista.
export const LEAGUES = [
  { code: 'col.1', name: 'Liga BetPlay', country: 'Colombia', espn: 'col.1', source: 'espn', emblem: 'https://a.espncdn.com/i/leaguelogos/soccer/500/1543.png' },
  { code: 'PL', name: 'Premier League', country: 'Inglaterra', espn: 'eng.1' },
  { code: 'PD', name: 'LaLiga', country: 'España', espn: 'esp.1' },
  { code: 'SA', name: 'Serie A', country: 'Italia', espn: 'ita.1' },
  { code: 'BL1', name: 'Bundesliga', country: 'Alemania', espn: 'ger.1' },
  { code: 'FL1', name: 'Ligue 1', country: 'Francia', espn: 'fra.1' },
  { code: 'CL', name: 'Champions League', country: 'Europa', espn: 'uefa.champions' },
  { code: 'CLI', name: 'Copa Libertadores', country: 'Sudamérica', espn: 'conmebol.libertadores' },
  { code: 'BSA', name: 'Brasileirão', country: 'Brasil', espn: 'bra.1' },
  { code: 'arg.1', name: 'Liga Profesional', country: 'Argentina', espn: 'arg.1', source: 'espn', emblem: 'https://a.espncdn.com/i/leaguelogos/soccer/500/1.png' },
  { code: 'mex.1', name: 'Liga MX', country: 'México', espn: 'mex.1', source: 'espn', emblem: 'https://a.espncdn.com/i/leaguelogos/soccer/500/22.png' },
  { code: 'usa.1', name: 'MLS', country: 'Estados Unidos', espn: 'usa.1', source: 'espn', emblem: 'https://a.espncdn.com/i/leaguelogos/soccer/500/19.png' },
];

export const leagueByCode = (code) => LEAGUES.find((l) => l.code === code) ?? null;
export const leagueEmblem = (code) => leagueByCode(code)?.emblem ?? `https://crests.football-data.org/${code}.png`;
export const isEspnLeague = (code) => leagueByCode(code)?.source === 'espn';

// shortcut: equipo de "Mi equipo" fijo hasta que el usuario lo elija con su cuenta (users/{uid}.favoriteTeam).
export const DEFAULT_TEAM = { id: 86, name: 'Real Madrid', league: 'PD' };
