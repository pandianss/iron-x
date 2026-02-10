import { Router } from 'express';
import { getUserOutcomes, triggerEvaluation, triggerBaselineComparison, getTeamOutcomes, getOrgSummary, getCSVReport, estimateCost, getValueDashboard } from '../controllers/outcomeController';
import { outcomeGovernanceMiddleware } from '../middleware/outcomeGovernanceMiddleware';

const router = Router();

router.use(outcomeGovernanceMiddleware);

router.get('/user/:userId', getUserOutcomes);
router.get('/team/:teamId', getTeamOutcomes);
router.get('/org/summary', getOrgSummary);
router.get('/report/csv', getCSVReport);
router.get('/value-dashboard/:userId', getValueDashboard);
router.post('/evaluate/:userId', triggerEvaluation);
router.post('/baseline/:userId', triggerBaselineComparison);
router.post('/cost-estimation/:userId', estimateCost);

export default router;
