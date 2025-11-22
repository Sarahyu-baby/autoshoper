export interface Product {
  id: string;
  name: string;
  price: number;
  brand: string;
  category: string;
  imageUrl: string;
  productUrl: string;
  rating: number | null;
  reviewCount: number;
  sourcePlatform: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProductData {
  name: string;
  price: number;
  brand: string;
  category: string;
  imageUrl: string;
  productUrl: string;
  rating?: number;
  reviewCount?: number;
  sourcePlatform: string;
}

export interface UpdateProductData {
  name?: string;
  price?: number;
  brand?: string;
  category?: string;
  imageUrl?: string;
  productUrl?: string;
  rating?: number | null;
  reviewCount?: number;
  sourcePlatform?: string;
}

export interface ProductSearchFilters {
  brand?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  sourcePlatform?: string;
}

export interface QueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  ascending?: boolean;
  filters?: ProductSearchFilters;
}

export interface DatabaseResponse<T> {
  data: T | null;
  error: Error | null;
  count?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}