import { Product, ProductSearchParams, ProductSearchResponse } from '../types/product';
import { ShoppingStrategy } from '../types/strategy';
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

export const geminiSearch = async (query: string, strategy: ShoppingStrategy): Promise<ProductSearchResponse> => {
  const response = await fetch(`${API_BASE_URL}/gemini/search-only`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ customerInput: query, strategy: { type: strategy } })
  });

  const json = await response.json().catch(async () => ({ error: await response.text() }));
  if (!response.ok) {
    const msg = (json && (json.error || (json.data && json.data.error))) || 'Gemini search failed';
    throw new Error(msg);
  }

  const data = json.data || json;
  const products = (data.products || []).map((p: any): Product => ({
    id: p.productUrl || `${p.brand}-${p.name}-${p.price}-${Math.random().toString(36).slice(2)}`,
    name: p.name,
    price: p.price,
    brand: p.brand,
    category: p.category || 'Unknown',
    imageUrl: p.imageUrl || 'https://via.placeholder.com/300x300',
    productUrl: p.productUrl || '#',
    rating: typeof p.rating === 'number' ? p.rating : 0,
    reviewCount: typeof p.reviewCount === 'number' ? p.reviewCount : 0,
    sourcePlatform: p.sourcePlatform || 'Gemini',
    createdAt: new Date()
  }));

  return {
    products,
    total: products.length,
    page: 1,
    limit: products.length
  };
};