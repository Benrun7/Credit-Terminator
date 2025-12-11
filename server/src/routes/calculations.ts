import { Router } from 'express';
import { CalculationsController } from '../controllers/calculationsController.js';

const router = Router();

router.post('/projection', CalculationsController.calculateProjection);
router.post('/compare', CalculationsController.compareStrategies);

export default router;

