import { CommentAnalysis } from '../types/comment';

// Mock comment analysis data
const mockCommentAnalysis: { [productId: string]: CommentAnalysis } = {
  '1': {
    productId: '1',
    totalComments: 2547,
    averageRating: 4.8,
    sentimentDistribution: {
      positive: 2150,
      negative: 150,
      neutral: 247
    },
    topKeywords: [
      { keyword: 'premium', frequency: 892 },
      { keyword: 'quality', frequency: 756 },
      { keyword: 'camera', frequency: 634 },
      { keyword: 'battery', frequency: 521 },
      { keyword: 'design', frequency: 487 }
    ],
    qualityIndicators: [
      { indicator: 'excellent build quality', mentions: 445 },
      { indicator: 'premium materials', mentions: 389 },
      { indicator: 'long-lasting battery', mentions: 334 },
      { indicator: 'superb camera', mentions: 298 },
      { indicator: 'smooth performance', mentions: 276 }
    ],
    commonIssues: ['expensive', 'heavy', 'learning curve'],
    positiveAspects: ['build quality', 'camera system', 'battery life', 'display', 'performance']
  },
  '2': {
    productId: '2',
    totalComments: 1892,
    averageRating: 4.7,
    sentimentDistribution: {
      positive: 1583,
      negative: 132,
      neutral: 177
    },
    topKeywords: [
      { keyword: 'display', frequency: 654 },
      { keyword: 'camera', frequency: 589 },
      { keyword: 'battery', frequency: 521 },
      { keyword: 'performance', frequency: 467 },
      { keyword: 'premium', frequency: 423 }
    ],
    qualityIndicators: [
      { indicator: 'amazing display', mentions: 398 },
      { indicator: 'versatile camera', mentions: 356 },
      { indicator: 'all-day battery', mentions: 298 },
      { indicator: 'powerful performance', mentions: 267 },
      { indicator: 'premium build', mentions: 234 }
    ],
    commonIssues: ['pricey', 'complex features', 'size'],
    positiveAspects: ['display quality', 'camera versatility', 'battery life', 'S Pen', 'performance']
  },
  '3': {
    productId: '3',
    totalComments: 1234,
    averageRating: 4.6,
    sentimentDistribution: {
      positive: 1021,
      negative: 98,
      neutral: 115
    },
    topKeywords: [
      { keyword: 'camera', frequency: 445 },
      { keyword: 'pure android', frequency: 389 },
      { keyword: 'ai features', frequency: 334 },
      { keyword: 'battery', frequency: 298 },
      { keyword: 'value', frequency: 267 }
    ],
    qualityIndicators: [
      { indicator: 'excellent camera', mentions: 298 },
      { indicator: 'clean android', mentions: 234 },
      { indicator: 'great value', mentions: 198 },
      { indicator: 'ai photography', mentions: 167 },
      { indicator: 'reliable battery', mentions: 145 }
    ],
    commonIssues: ['heating', 'limited storage', 'availability'],
    positiveAspects: ['camera quality', 'stock android', 'ai features', 'price point', 'google integration']
  },
  '4': {
    productId: '4',
    totalComments: 892,
    averageRating: 4.5,
    sentimentDistribution: {
      positive: 734,
      negative: 89,
      neutral: 69
    },
    topKeywords: [
      { keyword: 'fast charging', frequency: 334 },
      { keyword: 'performance', frequency: 298 },
      { keyword: 'value', frequency: 267 },
      { keyword: 'oxygen os', frequency: 234 },
      { keyword: 'smooth', frequency: 198 }
    ],
    qualityIndicators: [
      { indicator: 'super fast charging', mentions: 234 },
      { indicator: 'smooth performance', mentions: 198 },
      { indicator: 'great value', mentions: 167 },
      { indicator: 'clean software', mentions: 145 },
      { indicator: 'reliable build', mentions: 123 }
    ],
    commonIssues: ['camera could be better', 'no wireless charging', 'availability'],
    positiveAspects: ['charging speed', 'performance', 'software', 'price', 'build quality']
  },
  '5': {
    productId: '5',
    totalComments: 567,
    averageRating: 4.4,
    sentimentDistribution: {
      positive: 456,
      negative: 67,
      neutral: 44
    },
    topKeywords: [
      { keyword: 'affordable', frequency: 234 },
      { keyword: 'camera', frequency: 198 },
      { keyword: 'battery', frequency: 167 },
      { keyword: 'value', frequency: 145 },
      { keyword: 'miui', frequency: 123 }
    ],
    qualityIndicators: [
      { indicator: 'affordable price', mentions: 167 },
      { indicator: 'good camera', mentions: 145 },
      { indicator: 'decent battery', mentions: 123 },
      { indicator: 'great value', mentions: 98 },
      { indicator: 'solid build', mentions: 87 }
    ],
    commonIssues: ['miui ads', 'bloatware', 'availability'],
    positiveAspects: ['price', 'camera', 'battery life', 'build quality', 'features']
  }
};

export const analyzeComments = async (productId: string, comments: any[]): Promise<CommentAnalysis> => {
  // Simulate analysis delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // For demo purposes, return mock analysis
  // In real implementation, this would:
  // 1. Clean and preprocess comments
  // 2. Apply sentiment analysis
  // 3. Extract keywords
  // 4. Identify quality indicators
  // 5. Detect common issues and positive aspects
  
  if (mockCommentAnalysis[productId]) {
    return mockCommentAnalysis[productId];
  }
  
  // Return default analysis for unknown products
  return {
    productId,
    totalComments: comments.length,
    averageRating: 4.0,
    sentimentDistribution: {
      positive: Math.floor(comments.length * 0.7),
      negative: Math.floor(comments.length * 0.1),
      neutral: Math.floor(comments.length * 0.2)
    },
    topKeywords: [
      { keyword: 'quality', frequency: 50 },
      { keyword: 'value', frequency: 40 },
      { keyword: 'performance', frequency: 35 }
    ],
    qualityIndicators: [
      { indicator: 'good quality', mentions: 30 },
      { indicator: 'fair price', mentions: 25 }
    ],
    commonIssues: ['none significant'],
    positiveAspects: ['general satisfaction']
  };
};

export const getCommentAnalysis = async (productId: string): Promise<CommentAnalysis | null> => {
  // Simulate database lookup delay
  await new Promise(resolve => setTimeout(resolve, 200));
  
  return mockCommentAnalysis[productId] || null;
};