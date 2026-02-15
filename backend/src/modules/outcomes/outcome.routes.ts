import { Router } from 'express';
import { container } from 'tsyringe';
import { OutcomeController } from './outcome.controller';
import { governanceGuard } from '../../middleware/governanceGuard';

const router = Router();
const outcomeController = container.resolve(OutcomeController);

router.use(governanceGuard);

router.get('/user/:userId', outcomeController.getUserOutcomes);
router.get('/team/:teamId', outcomeController.getTeamOutcomes);
router.get('/org/summary', outcomeController.getOrgSummary);
router.get('/report/csv', outcomeController.getCSVReport);
router.get('/value-dashboard/:userId', outcomeController.getValueDashboard);
router.post('/evaluate/:userId', outcomeController.triggerEvaluation);
router.post('/baseline/:userId', outcomeController.triggerBaselineComparison);
router.post('/cost-estimation/:userId', outcomeController.estimateCost);

export default router;
