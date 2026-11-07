import { gameContext } from '@/lib/game/route-helpers';
import { awardCheckin } from '@/lib/game/award';

// Visita del día: suma la racha (una vez por día, hora de Colombia).
export async function POST(request) {
  const { db, user, error } = await gameContext(request);
  if (error) return error;
  const { added, game } = await awardCheckin(db, user.uid);
  return Response.json({ added, game });
}
