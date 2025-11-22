export interface Product {
  id: string;
  name: string;
  price: number;
  brand: string;
  category: string;
  imageUrl: string;
  productUrl: string;
  rating: number;
  reviewCount: number;
  sourcePlatform: string;
  createdAt: Date;
}

export interface ProductSearchParams {
  query: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  brand?: string;
  limit?: number;
}

export interface ProductSearchResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
}