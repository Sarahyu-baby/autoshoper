import { Request, Response, NextFunction } from 'express';

/**
 * Global error handler middleware
 */
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction): void => {
  console.error('Error:', err);
  
  // Supabase specific errors
  if (err.message?.includes('JWT')) {
    res.status(401).json({
      success: false,
      error: 'Authentication required',
      code: 'AUTH_REQUIRED'
    });
    return;
  }

  if (err.message?.includes('permission denied')) {
    res.status(403).json({
      success: false,
      error: 'Permission denied',
      code: 'PERMISSION_DENIED'
    });
    return;
  }

  if (err.message?.includes('not found')) {
    res.status(404).json({
      success: false,
      error: err.message,
      code: 'NOT_FOUND'
    });
    return;
  }

  if (err.message?.includes('invalid')) {
    res.status(400).json({
      success: false,
      error: err.message,
      code: 'INVALID_INPUT'
    });
    return;
  }

  // Generic server error
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    code: 'INTERNAL_ERROR'
  });
};

/**
 * Async route handler wrapper to catch errors
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Validation middleware for product data
 */
export const validateProductData = (req: Request, res: Response, next: NextFunction): void => {
  const { name, price, brand, category, imageUrl, productUrl, sourcePlatform } = req.body;

  const errors: string[] = [];

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    errors.push('Name is required and must be a non-empty string');
  }

  if (typeof price !== 'number' || price < 0) {
    errors.push('Price must be a non-negative number');
  }

  if (!brand || typeof brand !== 'string' || brand.trim().length === 0) {
    errors.push('Brand is required and must be a non-empty string');
  }

  if (!category || typeof category !== 'string' || category.trim().length === 0) {
    errors.push('Category is required and must be a non-empty string');
  }

  if (!imageUrl || typeof imageUrl !== 'string' || !isValidUrl(imageUrl)) {
    errors.push('Image URL is required and must be a valid URL');
  }

  if (!productUrl || typeof productUrl !== 'string' || !isValidUrl(productUrl)) {
    errors.push('Product URL is required and must be a valid URL');
  }

  if (!sourcePlatform || typeof sourcePlatform !== 'string' || sourcePlatform.trim().length === 0) {
    errors.push('Source platform is required and must be a non-empty string');
  }

  if (req.body.rating !== undefined) {
    if (typeof req.body.rating !== 'number' || req.body.rating < 0 || req.body.rating > 5) {
      errors.push('Rating must be a number between 0 and 5');
    }
  }

  if (req.body.reviewCount !== undefined) {
    if (typeof req.body.reviewCount !== 'number' || req.body.reviewCount < 0) {
      errors.push('Review count must be a non-negative number');
    }
  }

  if (errors.length > 0) {
    res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors
    });
    return;
  }

  next();
};

/**
 * Validation middleware for UUID
 */
export const validateUUID = (req: Request, res: Response, next: NextFunction): void => {
  const { id } = req.params;
  
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  
  if (!id || !uuidRegex.test(id)) {
    res.status(400).json({
      success: false,
      error: 'Invalid UUID format',
      code: 'INVALID_UUID'
    });
    return;
  }

  next();
};

/**
 * Helper function to validate URL
 */
const isValidUrl = (string: string): boolean => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};