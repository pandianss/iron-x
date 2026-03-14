
import { Request, Response } from 'express';
import prisma from '../../db';

export async function getPublicProfile(req: Request, res: Response) {
  const { username } = req.params;

  const user = await prisma.user.findFirst({
    where: { email: { startsWith: `${username}@` } },
    select: {
      user_id: true,
      current_discipline_score: true,
      discipline_classification: true,
      trust_tier: true,
      public_score_enabled: true,
      created_at: true,
      discipline_scores: {
        orderBy: { date: 'desc' },
        take: 30,
        select: { score: true, date: true }
      }
    }
  });

  if (!user || !user.public_score_enabled) {
    return res.status(404).json({ error: 'Profile not found or not public.' });
  }

  return res.json({
    username,
    score: user.current_discipline_score,
    classification: user.discipline_classification,
    trust_tier: user.trust_tier,
    member_since: user.created_at,
    score_history: user.discipline_scores.reverse() // Forward chronological for chart
  });
}
