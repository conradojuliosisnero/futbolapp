import { gameContext } from '@/lib/game/route-helpers';
import { awardNews } from '@/lib/game/award';

// Noticia abierta: suma una vez por nota, hasta NEWS_PER_DAY notas por día.
export async function POST(request) {
  const { db, user, error } = await gameContext(request);
  if (error) return error;
  const { url } = (await request.json().catch(() => null)) ?? {};
  let ok = false;
  try { ok = typeof url === 'string' && url.length < 500 && /(^|\.)espn(deportes)?\.com(\.[a-z]{2})?$/.test(new URL(url).hostname); } catch { /* url inválida */ }
  if (!ok) return Response.json({ error: 'Noticia inválida.' }, { status: 400 });
  const { added } = await awardNews(db, user.uid, url);
  return Response.json({ added });
}
