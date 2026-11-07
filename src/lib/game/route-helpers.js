import 'server-only';
import { adminDb } from '@/lib/firebase/admin';
import { userFromRequest } from '@/lib/firebase/server-session';

/** Usuario + base de datos para las rutas de puntos, o una respuesta de error lista para devolver. */
export async function gameContext(request) {
  const db = adminDb();
  if (!db) return { error: Response.json({ error: 'Los puntos no están disponibles en este momento.' }, { status: 503 }) };
  const user = await userFromRequest(request);
  if (!user) return { error: Response.json({ error: 'Inicia sesión para ganar puntos.' }, { status: 401 }) };
  return { db, user };
}
