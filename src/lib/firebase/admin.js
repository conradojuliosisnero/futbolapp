import 'server-only';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// Firebase con permisos de servidor (salta las reglas de Firestore). Solo para tareas del servidor:
// avisos, puntos, conteo de peticiones y panel de admin.
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

function app() {
  if (getApps().length) return getApps()[0];
  const creds = credentials();
  return creds ? initializeApp({ credential: cert(creds) }) : null;
}

/** Firestore de servidor, o null si falta la clave de servicio. */
export function adminDb() {
  return app() ? getFirestore() : null;
}

/** Auth de servidor (verificar sesiones, listar usuarios), o null si falta la clave de servicio. */
export function adminAuth() {
  return app() ? getAuth() : null;
}
