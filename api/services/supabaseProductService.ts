import { supabase } from '../config/supabase.js';
import { Product, CreateProductData, UpdateProductData, ProductSearchFilters, QueryOptions, DatabaseResponse } from '../types/supabase.js';

/**
 * Creates a new product in the database
 */
export const createProduct = async (productData: CreateProductData): Promise<DatabaseResponse<Product>> => {
  try {
    // Validate required fields
    const requiredFields: (keyof CreateProductData)[] = ['name', 'price', 'brand', 'category', 'imageUrl', 'productUrl', 'sourcePlatform'];
    const missingFields = requiredFields.filter(field => !productData[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Validate data types and constraints
    if (typeof productData.price !== 'number' || productData.price < 0) {
      throw new Error('Price must be a non-negative number');
    }

    if (productData.rating !== undefined && (typeof productData.rating !== 'number' || productData.rating < 0 || productData.rating > 5)) {
      throw new Error('Rating must be a number between 0 and 5');
    }

    if (productData.reviewCount !== undefined && (typeof productData.reviewCount !== 'number' || productData.reviewCount < 0)) {
      throw new Error('Review count must be a non-negative number');
    }

    // Map frontend field names to database column names
    const dbProductData = {
      name: productData.name,
      price: productData.price,
      brand: productData.brand,
      category: productData.category,
      image_url: productData.imageUrl,
      product_url: productData.productUrl,
      rating: productData.rating || null,
      review_count: productData.reviewCount || 0,
      source_platform: productData.sourcePlatform,
    };

    const { data, error } = await supabase
      .from('products')
      .insert([dbProductData])
      .select()
      .single();

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    // Transform database response back to frontend format
    const transformedData: Product = {
      id: data.id,
      name: data.name,
      price: parseFloat(data.price),
      brand: data.brand,
      category: data.category,
      imageUrl: data.image_url,
      productUrl: data.product_url,
      rating: data.rating ? parseFloat(data.rating) : null,
      reviewCount: data.review_count,
      sourcePlatform: data.source_platform,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };

    return { data: transformedData, error: null };
  } catch (error) {
    console.error('Error creating product:', error);
    return { data: null, error: error instanceof Error ? error : new Error('Unknown error occurred') };
  }
};

/**
 * Retrieves all products with optional filtering and pagination
 */
export const getAllProducts = async (options: QueryOptions = {}): Promise<{ data: Product[]; error: Error | null; count: number }> => {
  try {
    const {
      limit = 50,
      offset = 0,
      orderBy = 'created_at',
      ascending = false,
      filters = {}
    } = options;

    let query = supabase
      .from('products')
      .select('*', { count: 'exact' });

    // Apply filters
    if (filters.brand) {
      query = query.eq('brand', filters.brand);
    }
    
    if (filters.category) {
      query = query.eq('category', filters.category);
    }
    
    if (filters.minPrice !== undefined) {
      query = query.gte('price', filters.minPrice);
    }
    
    if (filters.maxPrice !== undefined) {
      query = query.lte('price', filters.maxPrice);
    }
    
    if (filters.minRating !== undefined) {
      query = query.gte('rating', filters.minRating);
    }
    
    if (filters.sourcePlatform) {
      query = query.eq('source_platform', filters.sourcePlatform);
    }

    // Apply ordering and pagination
    query = query
      .order(orderBy, { ascending })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    // Transform database response to frontend format
    const transformedData: Product[] = data ? data.map(product => ({
      id: product.id,
      name: product.name,
      price: parseFloat(product.price),
      brand: product.brand,
      category: product.category,
      imageUrl: product.image_url,
      productUrl: product.product_url,
      rating: product.rating ? parseFloat(product.rating) : null,
      reviewCount: product.review_count,
      sourcePlatform: product.source_platform,
      createdAt: new Date(product.created_at),
      updatedAt: new Date(product.updated_at),
    })) : [];

    return { data: transformedData, error: null, count: count || 0 };
  } catch (error) {
    console.error('Error getting all products:', error);
    return { data: [], error: error instanceof Error ? error : new Error('Unknown error occurred'), count: 0 };
  }
};

/**
 * Retrieves a single product by ID
 */
export const getProductById = async (id: string): Promise<DatabaseResponse<Product>> => {
  try {
    if (!id) {
      throw new Error('Product ID is required');
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      throw new Error('Invalid product ID format');
    }

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('Product not found');
      }
      throw new Error(`Database error: ${error.message}`);
    }

    if (!data) {
      return { data: null, error: null };
    }

    // Transform database response to frontend format
    const transformedData: Product = {
      id: data.id,
      name: data.name,
      price: parseFloat(data.price),
      brand: data.brand,
      category: data.category,
      imageUrl: data.image_url,
      productUrl: data.product_url,
      rating: data.rating ? parseFloat(data.rating) : null,
      reviewCount: data.review_count,
      sourcePlatform: data.source_platform,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };

    return { data: transformedData, error: null };
  } catch (error) {
    console.error('Error getting product by ID:', error);
    return { data: null, error: error instanceof Error ? error : new Error('Unknown error occurred') };
  }
};

/**
 * Updates a product by ID
 */
export const updateProduct = async (id: string, updates: UpdateProductData): Promise<DatabaseResponse<Product>> => {
  try {
    if (!id) {
      throw new Error('Product ID is required');
    }

    if (!updates || Object.keys(updates).length === 0) {
      throw new Error('No update data provided');
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      throw new Error('Invalid product ID format');
    }

    // Validate update data
    if (updates.price !== undefined && (typeof updates.price !== 'number' || updates.price < 0)) {
      throw new Error('Price must be a non-negative number');
    }

    if (updates.rating !== undefined && (typeof updates.rating !== 'number' || updates.rating < 0 || updates.rating > 5)) {
      throw new Error('Rating must be a number between 0 and 5');
    }

    if (updates.reviewCount !== undefined && (typeof updates.reviewCount !== 'number' || updates.reviewCount < 0)) {
      throw new Error('Review count must be a non-negative number');
    }

    // Map frontend field names to database column names
    const dbUpdates: Record<string, any> = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.price !== undefined) dbUpdates.price = updates.price;
    if (updates.brand !== undefined) dbUpdates.brand = updates.brand;
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.imageUrl !== undefined) dbUpdates.image_url = updates.imageUrl;
    if (updates.productUrl !== undefined) dbUpdates.product_url = updates.productUrl;
    if (updates.rating !== undefined) dbUpdates.rating = updates.rating;
    if (updates.reviewCount !== undefined) dbUpdates.review_count = updates.reviewCount;
    if (updates.sourcePlatform !== undefined) dbUpdates.source_platform = updates.sourcePlatform;

    const { data, error } = await supabase
      .from('products')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    if (!data) {
      throw new Error('Product not found');
    }

    // Transform database response to frontend format
    const transformedData: Product = {
      id: data.id,
      name: data.name,
      price: parseFloat(data.price),
      brand: data.brand,
      category: data.category,
      imageUrl: data.image_url,
      productUrl: data.product_url,
      rating: data.rating ? parseFloat(data.rating) : null,
      reviewCount: data.review_count,
      sourcePlatform: data.source_platform,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };

    return { data: transformedData, error: null };
  } catch (error) {
    console.error('Error updating product:', error);
    return { data: null, error: error instanceof Error ? error : new Error('Unknown error occurred') };
  }
};

/**
 * Deletes a product by ID
 */
export const deleteProduct = async (id: string): Promise<DatabaseResponse<boolean>> => {
  try {
    if (!id) {
      throw new Error('Product ID is required');
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      throw new Error('Invalid product ID format');
    }

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return { data: true, error: null };
  } catch (error) {
    console.error('Error deleting product:', error);
    return { data: false, error: error instanceof Error ? error : new Error('Unknown error occurred') };
  }
};

/**
 * Searches products by name, brand, or category
 */
export const searchProducts = async (query: string, options: { limit?: number; offset?: number } = {}): Promise<{ data: Product[]; error: Error | null; count: number }> => {
  try {
    if (!query || typeof query !== 'string') {
      throw new Error('Search query is required and must be a string');
    }

    const { limit = 20, offset = 0 } = options;

    const { data, error, count } = await supabase
      .from('products')
      .select('*', { count: 'exact' })
      .or(`name.ilike.%${query}%,brand.ilike.%${query}%,category.ilike.%${query}%`)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    // Transform database response to frontend format
    const transformedData: Product[] = data ? data.map(product => ({
      id: product.id,
      name: product.name,
      price: parseFloat(product.price),
      brand: product.brand,
      category: product.category,
      imageUrl: product.image_url,
      productUrl: product.product_url,
      rating: product.rating ? parseFloat(product.rating) : null,
      reviewCount: product.review_count,
      sourcePlatform: product.source_platform,
      createdAt: new Date(product.created_at),
      updatedAt: new Date(product.updated_at),
    })) : [];

    return { data: transformedData, error: null, count: count || 0 };
  } catch (error) {
    console.error('Error searching products:', error);
    return { data: [], error: error instanceof Error ? error : new Error('Unknown error occurred'), count: 0 };
  }
};