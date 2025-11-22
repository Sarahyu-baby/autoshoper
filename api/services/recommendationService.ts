import { ShoppingStrategy, RecommendationRequest, Recommendation } from '../types/strategy';
import { getCommentAnalysis } from './commentAnalysisService';
import { getProductById } from './productService';

export const generateRecommendations = async (
  productIds: string[], 
  strategy: ShoppingStrategy, 
  userPreferences?: RecommendationRequest['userPreferences']
): Promise<Recommendation[]> => {
  
  const recommendations: Recommendation[] = [];
  
  for (const productId of productIds) {
    const product = await getProductById(productId);
    const commentAnalysis = await getCommentAnalysis(productId);
    
    if (!product || !commentAnalysis) continue;
    
    const score = calculateStrategyScore(product, commentAnalysis, strategy);
    const reasoning = generateReasoning(product, commentAnalysis, strategy);
    const pros = generatePros(commentAnalysis);
    const cons = generateCons(commentAnalysis);
    
    recommendations.push({
      productId,
      score,
      ranking: 0, // Will be set after sorting
      reasoning,
      confidence: calculateConfidence(commentAnalysis),
      pros,
      cons
    });
  }
  
  // Sort by score and assign rankings
  recommendations.sort((a, b) => b.score - a.score);
  recommendations.forEach((rec, index) => {
    rec.ranking = index + 1;
  });
  
  return recommendations;
};

const calculateStrategyScore = (product: any, analysis: any, strategy: ShoppingStrategy): number => {
  switch (strategy) {
    case 'fancy':
      return calculateFancyScore(product, analysis);
    case 'cost-effective':
      return calculateCostEffectiveScore(product, analysis);
    case 'price-priority':
      return calculatePricePriorityScore(product, analysis);
    default:
      return 0;
  }
};

const calculateFancyScore = (product: any, analysis: any): number => {
  let score = 0;
  
  // Brand reputation (30%)
  const brandScore = getBrandScore(product.brand);
  score += brandScore * 0.3;
  
  // Premium features (25%)
  const premiumScore = countKeywordMentions(analysis.topKeywords, ['premium', 'luxury', 'high-end', 'premium quality']) / 100;
  score += Math.min(premiumScore, 1) * 0.25;
  
  // Quality indicators (25%)
  const qualityScore = analysis.qualityIndicators.length > 0 ? analysis.qualityIndicators[0].mentions / 500 : 0;
  score += Math.min(qualityScore, 1) * 0.25;
  
  // Design/aesthetic mentions (20%)
  const designScore = countKeywordMentions(analysis.topKeywords, ['design', 'beautiful', 'elegant', 'stylish']) / 100;
  score += Math.min(designScore, 1) * 0.2;
  
  return Math.round(score * 100) / 100;
};

const calculateCostEffectiveScore = (product: any, analysis: any): number => {
  let score = 0;
  
  // Value-for-money ratio (40%)
  const priceScore = Math.max(0, (2000 - product.price) / 2000); // Cheaper is better, but not too cheap
  const qualityScore = analysis.averageRating / 5;
  const valueScore = (priceScore + qualityScore) / 2;
  score += valueScore * 0.4;
  
  // Durability mentions (30%)
  const durabilityScore = countKeywordMentions(analysis.topKeywords, ['durable', 'long-lasting', 'reliable', 'sturdy']) / 100;
  score += Math.min(durabilityScore, 1) * 0.3;
  
  // "Worth it" mentions (20%)
  const worthItScore = countKeywordMentions(analysis.topKeywords, ['worth it', 'good value', 'great value', 'worth every penny']) / 50;
  score += Math.min(worthItScore, 1) * 0.2;
  
  // Long-term satisfaction (10%)
  const longTermScore = analysis.sentimentDistribution.positive / analysis.totalComments;
  score += longTermScore * 0.1;
  
  return Math.round(score * 100) / 100;
};

const calculatePricePriorityScore = (product: any, analysis: any): number => {
  let score = 0;
  
  // Price competitiveness (50%)
  const priceScore = Math.max(0, (1500 - product.price) / 1500); // Lower price = higher score
  score += priceScore * 0.5;
  
  // Basic quality threshold (30%)
  const qualityScore = analysis.averageRating >= 4.0 ? 1 : analysis.averageRating / 4.0;
  score += qualityScore * 0.3;
  
  // Avoid concerning issues (20%)
  const issueScore = 1 - (analysis.commonIssues.length / 10); // Fewer issues = higher score
  score += Math.max(0, issueScore) * 0.2;
  
  return Math.round(score * 100) / 100;
};

const getBrandScore = (brand: string): number => {
  const brandScores: { [key: string]: number } = {
    'Apple': 0.95,
    'Samsung': 0.9,
    'Google': 0.85,
    'OnePlus': 0.8,
    'Xiaomi': 0.7
  };
  return brandScores[brand] || 0.5;
};

const countKeywordMentions = (keywords: { keyword: string; frequency: number }[], targetWords: string[]): number => {
  return keywords
    .filter(k => targetWords.some(word => k.keyword.toLowerCase().includes(word)))
    .reduce((sum, k) => sum + k.frequency, 0);
};

const generateReasoning = (product: any, analysis: any, strategy: ShoppingStrategy): string[] => {
  const reasoning: string[] = [];
  
  switch (strategy) {
    case 'fancy':
      reasoning.push(`Premium brand reputation: ${product.brand}`);
      reasoning.push(`High-quality build with ${analysis.qualityIndicators[0]?.mentions || 0} positive mentions`);
      reasoning.push(`Elegant design praised by users`);
      break;
    case 'cost-effective':
      reasoning.push(`Excellent value at $${product.price} with ${analysis.averageRating}/5 rating`);
      reasoning.push(`Durable and reliable based on user feedback`);
      reasoning.push(`Worth the investment for long-term use`);
      break;
    case 'price-priority':
      reasoning.push(`Most affordable option at $${product.price}`);
      reasoning.push(`Maintains quality with ${analysis.averageRating}/5 rating`);
      reasoning.push(`Good basic functionality without premium markup`);
      break;
  }
  
  return reasoning;
};

const generatePros = (analysis: any): string[] => {
  return analysis.positiveAspects.slice(0, 3) || ['Good overall quality', 'Reliable performance'];
};

const generateCons = (analysis: any): string[] => {
  return analysis.commonIssues.slice(0, 2) || ['Minor issues reported'];
};

const calculateConfidence = (analysis: any): number => {
  const minReviews = 100;
  const maxReviews = 1000;
  const reviewScore = Math.min(analysis.totalComments / maxReviews, 1);
  const ratingScore = analysis.averageRating / 5;
  
  return Math.round((reviewScore * 0.6 + ratingScore * 0.4) * 100) / 100;
};