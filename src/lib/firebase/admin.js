import 'server-only';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Firebase con permisos de servidor (salta las reglas de Firestore). Solo para tareas del servidor, como enviar avisos.
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
