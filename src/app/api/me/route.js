import { userFromRequest, isAdmin } from '@/lib/firebase/server-session';

// ¿Esta cuenta es la de admin? Lo usa el menú para mostrar "Panel de admin" sin poner el correo en el navegador.
export async function GET(request) {
  const user = await userFromRequest(request);
  return Response.json({ admin: isAdmin(user) }, { headers: { 'Cache-Control': 'private, no-store' } });
}
