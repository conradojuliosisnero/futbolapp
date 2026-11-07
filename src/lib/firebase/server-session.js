import 'server-only';
import { cookies } from 'next/headers';
import { createRemoteJWKSet, jwtVerify } from 'jose';

// Quién hace la petición. La app guarda el token de Firebase (dura 1 h y se renueva solo) en la cookie
// SESSION_COOKIE (ver session-sync.jsx) y también lo manda como "Authorization: Bearer" en sus llamadas a /api.
// El token se verifica aquí con las claves públicas de Google (igual que firebase-admin/auth, sin depender de él).
export const SESSION_COOKIE = 'm90_token';

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
// jose guarda las claves en memoria y las vuelve a pedir solo cuando Google las rota.
const JWKS = createRemoteJWKSet(new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com'));

/** Token verificado ({ uid, email, email_verified, ... }) o null. */
export async function verifyToken(token) {
  if (!token || !PROJECT_ID) return null;
  try {
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: `https://securetoken.google.com/${PROJECT_ID}`,
      audience: PROJECT_ID,
      algorithms: ['RS256'],
    });
    if (!payload.sub) return null;
    return { ...payload, uid: payload.sub };
  } catch {
    return null;
  }
}

/** Usuario de una petición a /api (Authorization: Bearer o cookie). */
export function userFromRequest(request) {
  const bearer = request.headers.get('authorization')?.match(/^Bearer (.+)$/)?.[1];
  return verifyToken(bearer ?? request.cookies?.get(SESSION_COOKIE)?.value);
}

/** Usuario de la página que se está generando (componentes de servidor). */
export async function currentUser() {
  return verifyToken((await cookies()).get(SESSION_COOKIE)?.value);
}

/** Solo la cuenta de ADMIN_EMAIL (con correo verificado, p. ej. entrando con Google). */
export function isAdmin(user) {
  const admin = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  return Boolean(admin && user?.email_verified && user.email?.toLowerCase() === admin);
}
