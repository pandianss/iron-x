import { Router } from 'express';
import { authenticateToken } from '../../middleware/authMiddleware';
import { checkSubscriptionTier } from '../../middleware/subscriptionMiddleware';
import { WitnessController } from './witness.controller';
import { SubscriptionTier } from '@prisma/client';

const router = Router();
const controller = new WitnessController();

router.use(authenticateToken);

// Subscription gate — INDIVIDUAL_PRO and above only
router.use(checkSubscriptionTier([SubscriptionTier.INDIVIDUAL_PRO, SubscriptionTier.TEAM_ENTERPRISE]));

router.post('/actions/:actionId/witness', (req, res) => controller.assignWitness(req, res));
router.delete('/actions/:actionId/witness', (req, res) => controller.removeWitness(req, res));
router.get('/watching', (req, res) => controller.getMyWitnessedActions(req, res));
router.get('/notifications', (req, res) => controller.getWitnessNotifications(req, res));
router.get('/eligible', (req, res) => controller.getTeamMembersForWitness(req, res));

export default router;
