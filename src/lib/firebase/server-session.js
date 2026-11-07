import 'server-only';
import { cookies } from 'next/headers';
import { adminAuth } from './admin';

// Quién hace la petición. La app guarda el token de Firebase (dura 1 h y se renueva solo) en la cookie
// SESSION_COOKIE (ver session-sync.jsx) y también lo manda como "Authorization: Bearer" en sus llamadas a /api.
export const SESSION_COOKIE = 'm90_token';

/** Token verificado ({ uid, email, email_verified, ... }) o null. */
export async function verifyToken(token) {
  const auth = token && adminAuth();
  if (!auth) return null;
  try { return await auth.verifyIdToken(token); } catch { return null; }
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
