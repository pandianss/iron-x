
import { Router } from 'express';
import { getPublicProfile } from './publicProfile.controller';
import { PublicBadgeService } from '../../services/publicBadge.service';
import prisma from '../../db';

const router = Router();
const badgeService = new PublicBadgeService(prisma);

router.get('/u/:username', getPublicProfile);

router.get('/u/:username/badge.svg', async (req, res) => {
  const { username } = req.params;
  const user = await prisma.user.findFirst({
    where: { email: { startsWith: `${username}@` } },
    select: { 
        current_discipline_score: true, 
        discipline_classification: true, 
        trust_tier: true, 
        public_score_enabled: true 
    }
  });

  if (!user || !user.public_score_enabled) {
    return res.status(404).send('Not found');
  }

  const svg = badgeService.generateSvgBadge({
    score: user.current_discipline_score,
    classification: user.discipline_classification,
    tier: user.trust_tier
  });

  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'max-age=3600');
  return res.send(svg);
});

export default router;
