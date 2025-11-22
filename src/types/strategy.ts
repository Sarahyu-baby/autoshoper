export type ShoppingStrategy = 'fancy' | 'cost-effective' | 'price-priority';

export interface StrategyWeights {
  fancy: {
    brandReputation: number;
    premiumFeatures: number;
    qualityIndicators: number;
    designAesthetics: number;
  };
  'cost-effective': {
    valueRatio: number;
    durability: number;
    worthItMentions: number;
    longTermSatisfaction: number;
  };
  'price-priority': {
    priceCompetitiveness: number;
    basicQualityThreshold: number;
    avoidConcerningIssues: number;
  };
}

export interface RecommendationRequest {
  products: string[];
  strategy: ShoppingStrategy;
  userPreferences?: {
    priceRange?: { min: number; max: number };
    preferredBrands?: string[];
    excludedKeywords?: string[];
  };
}

export interface Recommendation {
  productId: string;
  score: number;
  ranking: number;
  reasoning: string[];
  confidence: number;
  pros: string[];
  cons: string[];
}