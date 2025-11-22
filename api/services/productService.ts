import { Product, ProductSearchParams, ProductSearchResponse } from '../types/product';

// Mock product data for demonstration
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'iPhone 15 Pro Max',
    price: 1199,
    brand: 'Apple',
    category: 'Smartphones',
    imageUrl: 'https://via.placeholder.com/300x300',
    productUrl: 'https://example.com/iphone-15-pro-max',
    rating: 4.8,
    reviewCount: 2547,
    sourcePlatform: 'Amazon',
    createdAt: new Date()
  },
  {
    id: '2',
    name: 'Samsung Galaxy S24 Ultra',
    price: 1299,
    brand: 'Samsung',
    category: 'Smartphones',
    imageUrl: 'https://via.placeholder.com/300x300',
    productUrl: 'https://example.com/galaxy-s24-ultra',
    rating: 4.7,
    reviewCount: 1892,
    sourcePlatform: 'Amazon',
    createdAt: new Date()
  },
  {
    id: '3',
    name: 'Google Pixel 8 Pro',
    price: 999,
    brand: 'Google',
    category: 'Smartphones',
    imageUrl: 'https://via.placeholder.com/300x300',
    productUrl: 'https://example.com/pixel-8-pro',
    rating: 4.6,
    reviewCount: 1234,
    sourcePlatform: 'Best Buy',
    createdAt: new Date()
  },
  {
    id: '4',
    name: 'OnePlus 12',
    price: 799,
    brand: 'OnePlus',
    category: 'Smartphones',
    imageUrl: 'https://via.placeholder.com/300x300',
    productUrl: 'https://example.com/oneplus-12',
    rating: 4.5,
    reviewCount: 892,
    sourcePlatform: 'Amazon',
    createdAt: new Date()
  },
  {
    id: '5',
    name: 'Xiaomi 14 Ultra',
    price: 699,
    brand: 'Xiaomi',
    category: 'Smartphones',
    imageUrl: 'https://via.placeholder.com/300x300',
    productUrl: 'https://example.com/xiaomi-14-ultra',
    rating: 4.4,
    reviewCount: 567,
    sourcePlatform: 'AliExpress',
    createdAt: new Date()
  }
];

export const searchProducts = async (params: ProductSearchParams): Promise<ProductSearchResponse> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  let filteredProducts = mockProducts.filter(product => 
    product.name.toLowerCase().includes(params.query.toLowerCase()) ||
    product.brand.toLowerCase().includes(params.query.toLowerCase()) ||
    product.category.toLowerCase().includes(params.query.toLowerCase())
  );

  // Apply filters
  if (params.category) {
    filteredProducts = filteredProducts.filter(p => p.category === params.category);
  }
  
  if (params.brand) {
    filteredProducts = filteredProducts.filter(p => p.brand.toLowerCase().includes(params.brand!.toLowerCase()));
  }
  
  if (params.minPrice) {
    filteredProducts = filteredProducts.filter(p => p.price >= params.minPrice!);
  }
  
  if (params.maxPrice) {
    filteredProducts = filteredProducts.filter(p => p.price <= params.maxPrice!);
  }

  // Apply limit
  const limitedProducts = filteredProducts.slice(0, params.limit || 20);

  return {
    products: limitedProducts,
    total: filteredProducts.length,
    page: 1,
    limit: params.limit || 20
  };
};

export const getProductById = async (id: string): Promise<Product | null> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 200));
  
  return mockProducts.find(p => p.id === id) || null;
};