import { Router } from 'express';
import { searchProducts, getProductDetails } from '../controllers/productController';

const router = Router();

router.get('/search', searchProducts);
router.get('/:id', getProductDetails);

export default router;