import { Router } from 'express';
import { createProduct, getAllProducts, getProductById, updateProduct, deleteProduct, searchProducts } from '../services/supabaseProductService.js';

const router = Router();

/**
 * GET /api/products
 * Get all products with optional filtering and pagination
 */
router.get('/', async (req, res) => {
  try {
    const {
      page = '1',
      limit = '50',
      brand,
      category,
      minPrice,
      maxPrice,
      minRating,
      sourcePlatform,
      orderBy = 'created_at',
      order = 'desc'
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    // Build filters object
    const filters = {};
    if (brand) filters.brand = brand;
    if (category) filters.category = category;
    if (minPrice) filters.minPrice = parseFloat(minPrice);
    if (maxPrice) filters.maxPrice = parseFloat(maxPrice);
    if (minRating) filters.minRating = parseFloat(minRating);
    if (sourcePlatform) filters.sourcePlatform = sourcePlatform;

    const options = {
      limit: limitNum,
      offset,
      orderBy,
      ascending: order === 'asc',
      filters
    };

    const { data, error, count } = await getAllProducts(options);

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }

    const totalPages = Math.ceil(count / limitNum);

    res.json({
      success: true,
      data,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count,
        totalPages,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1
      }
    });
  } catch (error) {
    console.error('Error in GET /products:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * GET /api/products/search
 * Search products by name, brand, or category
 */
router.get('/search', async (req, res) => {
  try {
    const { query, limit = '20', page = '1' } = req.query;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Query parameter is required and must be a string'
      });
    }

    const limitNum = parseInt(limit);
    const pageNum = parseInt(page);
    const offset = (pageNum - 1) * limitNum;

    const options = { limit: limitNum, offset };

    const { data, error, count } = await searchProducts(query, options);

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }

    const totalPages = Math.ceil(count / limitNum);

    res.json({
      success: true,
      data,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count,
        totalPages,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1
      }
    });
  } catch (error) {
    console.error('Error in GET /products/search:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * GET /api/products/:id
 * Get a single product by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await getProductById(id);

    if (error) {
      if (error.message === 'Product not found') {
        return res.status(404).json({
          success: false,
          error: 'Product not found'
        });
      }
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }

    if (!data) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error in GET /products/:id:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * POST /api/products
 * Create a new product
 */
router.post('/', async (req, res) => {
  try {
    const productData = req.body;

    const { data, error } = await createProduct(productData);

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }

    res.status(201).json({
      success: true,
      data,
      message: 'Product created successfully'
    });
  } catch (error) {
    console.error('Error in POST /products:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * PUT /api/products/:id
 * Update an existing product
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await updateProduct(id, updates);

    if (error) {
      if (error.message === 'Product not found') {
        return res.status(404).json({
          success: false,
          error: 'Product not found'
        });
      }
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }

    if (!data) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    res.json({
      success: true,
      data,
      message: 'Product updated successfully'
    });
  } catch (error) {
    console.error('Error in PUT /products/:id:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * DELETE /api/products/:id
 * Delete a product
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await deleteProduct(id);

    if (error) {
      if (error.message === 'Product not found') {
        return res.status(404).json({
          success: false,
          error: 'Product not found'
        });
      }
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }

    if (!data) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Error in DELETE /products/:id:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export default router;