export interface Comment {
  id: string;
  productId: string;
  content: string;
  rating: number;
  helpfulVotes: number;
  sentimentScore: number;
  keywords: string[];
  qualityIndicators: string[];
  createdAt: Date;
}

export interface CommentAnalysis {
  productId: string;
  totalComments: number;
  averageRating: number;
  sentimentDistribution: {
    positive: number;
    negative: number;
    neutral: number;
  };
  topKeywords: { keyword: string; frequency: number }[];
  qualityIndicators: { indicator: string; mentions: number }[];
  commonIssues: string[];
  positiveAspects: string[];
}