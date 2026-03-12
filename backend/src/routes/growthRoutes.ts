import { Router } from 'express';
import { GrowthController } from '../controllers/growthController';
import { container } from 'tsyringe';

const router = Router();
const controller = container.resolve(GrowthController);

router.get('/badge/:userId', controller.getPublicBadge);
router.get('/org/:orgId/analytics', controller.getOrgAnalytics);

export default router;
