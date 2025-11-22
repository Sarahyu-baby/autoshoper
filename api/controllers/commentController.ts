import { Request, Response } from 'express';
import { analyzeComments as analyzeCommentsService, getCommentAnalysis as getCommentAnalysisService } from '../services/commentAnalysisService';

export const analyzeComments = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const { comments } = req.body;

    if (!comments || !Array.isArray(comments)) {
      return res.status(400).json({ error: 'Comments array is required' });
    }

    const analysis = await analyzeCommentsService(productId, comments);
    res.json(analysis);
  } catch (error) {
    console.error('Error analyzing comments:', error);
    res.status(500).json({ error: 'Failed to analyze comments' });
  }
};

export const getCommentAnalysis = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const analysis = await getCommentAnalysisService(productId);
    
    if (!analysis) {
      return res.status(404).json({ error: 'Comment analysis not found' });
    }
    
    res.json(analysis);
  } catch (error) {
    console.error('Error getting comment analysis:', error);
    res.status(500).json({ error: 'Failed to get comment analysis' });
  }
};