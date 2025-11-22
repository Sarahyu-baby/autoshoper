import { Request, Response } from 'express';
import { ProductSearchParams } from '../types/product';
import { searchProducts as searchProductsService, getProductById } from '../services/productService';

export const searchProducts = async (req: Request, res: Response) => {
  try {
    const { query, category, minPrice, maxPrice, brand, limit = 20 } = req.query;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    const searchParams: ProductSearchParams = {
      query,
      category: category as string,
      minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
      brand: brand as string,
      limit: parseInt(limit as string)
    };

    const results = await searchProductsService(searchParams);
    res.json(results);
  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).json({ error: 'Failed to search products' });
  }
};

export const getProductDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await getProductById(id);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    console.error('Error getting product details:', error);
    res.status(500).json({ error: 'Failed to get product details' });
  }
};