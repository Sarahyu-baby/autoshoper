import { ProductSearchParams, ProductSearchResponse } from '../types/product';
import { CommentAnalysis } from '../types/comment';
import { RecommendationRequest, Recommendation } from '../types/strategy';

const API_BASE_URL = 'http://localhost:3001/api';

export const searchProducts = async (params: ProductSearchParams): Promise<ProductSearchResponse> => {
  const queryParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, value.toString());
    }
  });

  const response = await fetch(`${API_BASE_URL}/products/search?${queryParams}`);
  
  if (!response.ok) {
    throw new Error('Failed to search products');
  }
  
  return response.json();
};

export const getProductDetails = async (productId: string) => {
  const response = await fetch(`${API_BASE_URL}/products/${productId}`);
  
  if (!response.ok) {
    throw new Error('Failed to get product details');
  }
  
  return response.json();
};

export const analyzeComments = async (productId: string, comments: any[]): Promise<CommentAnalysis> => {
  const response = await fetch(`${API_BASE_URL}/comments/analyze/${productId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ comments }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to analyze comments');
  }
  
  return response.json();
};

export const getCommentAnalysis = async (productId: string): Promise<CommentAnalysis> => {
  const response = await fetch(`${API_BASE_URL}/comments/analysis/${productId}`);
  
  if (!response.ok) {
    throw new Error('Failed to get comment analysis');
  }
  
  return response.json();
};

export const generateRecommendations = async (request: RecommendationRequest): Promise<Recommendation[]> => {
  const response = await fetch(`${API_BASE_URL}/recommendations/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });
  
  if (!response.ok) {
    throw new Error('Failed to generate recommendations');
  }
  
  return response.json();
};