import nextVitals from 'eslint-config-next/core-web-vitals';

const config = [
  ...nextVitals,
  { ignores: ['.next/**', 'node_modules/**', 'out/**', 'graphify-out/**', 'new-interface/**'] },
];
export default config;
