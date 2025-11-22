import { Request, Response } from 'express';
import { RecommendationRequest } from '../types/strategy';
import { generateRecommendations } from '../services/recommendationService';

export const getRecommendations = async (req: Request, res: Response) => {
  try {
    const { products, strategy, userPreferences }: RecommendationRequest = req.body;

    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: 'Products array is required' });
    }

    if (!strategy) {
      return res.status(400).json({ error: 'Strategy is required' });
    }

    const recommendations = await generateRecommendations(products, strategy, userPreferences);
    res.json(recommendations);
  } catch (error) {
    console.error('Error generating recommendations:', error);
    res.status(500).json({ error: 'Failed to generate recommendations' });
  }
};