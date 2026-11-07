import 'server-only';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Firebase con permisos de servidor (salta las reglas de Firestore). Solo para tareas del servidor:
// avisos, puntos, conteo de peticiones y panel de admin.
// No se usa firebase-admin/auth: depende de jwks-rsa → jose (solo ESM) y en Vercel no carga
// (ERR_REQUIRE_ESM). Los tokens se verifican con jose en server-session.js.
// Clave: Consola de Firebase → Configuración del proyecto → Cuentas de servicio → "Generar nueva clave privada".
// Va en FIREBASE_SERVICE_ACCOUNT como el JSON completo en una línea, o en base64.
function credentials() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) return null;
  try {
    const text = raw.trim().startsWith('{') ? raw : Buffer.from(raw, 'base64').toString('utf8');
    return JSON.parse(text);
  } catch {
    console.error('FIREBASE_SERVICE_ACCOUNT no es un JSON válido (ni en texto ni en base64).');
    return null;
  }
}

/** Firestore de servidor, o null si falta la clave de servicio. */
export function adminDb() {
  if (!getApps().length) {
    const creds = credentials();
    if (!creds) return null;
    initializeApp({ credential: cert(creds) });
  }
  return getFirestore();
}
