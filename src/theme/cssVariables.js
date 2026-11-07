import { tokens } from './tokens';

const PREFIX = 'pb';
const kebab = (s) => String(s).replace(/([a-z])([A-Z0-9])/g, '$1-$2').toLowerCase();

/** Convierte los tokens en un bloque :root { --pb-... } */
export function buildCssVariables(t = tokens) {
  const lines = [];
  for (const [group, values] of Object.entries(t)) {
    for (const [name, value] of Object.entries(values)) {
      lines.push(`  --${PREFIX}-${kebab(group)}-${kebab(name)}: ${value};`);
    }
  }
  return `:root {\n${lines.join('\n')}\n}`;
}
