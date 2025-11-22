import { Router } from 'express';
import { getRecommendations } from '../controllers/recommendationController';

const router = Router();

router.post('/generate', getRecommendations);

export default router;