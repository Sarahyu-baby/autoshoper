import { Router } from 'express';
import { analyzeComments, getCommentAnalysis } from '../controllers/commentController';

const router = Router();

router.post('/analyze/:productId', analyzeComments);
router.get('/analysis/:productId', getCommentAnalysis);

export default router;