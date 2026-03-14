import { Router } from 'express';
import { authenticateToken } from '../../middleware/authMiddleware';
import { EvidencePackController } from './evidencePack.controller';

const router = Router();
const controller = new EvidencePackController();

router.use(authenticateToken);
router.post('/evidence-pack', (req, res) => controller.generateEvidencePack(req, res));

export default router;
