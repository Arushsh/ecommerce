import express from 'express';
import { protect, sellerOnly } from '../middleware/auth.middleware.js';
import {
    getMyProducts, createMyProduct, updateMyProduct,
    deleteMyProduct, getSellerStats,
} from '../controllers/seller.controller.js';
import { uploadImage } from '../middleware/upload.middleware.js';

const router = express.Router();

router.use(protect, sellerOnly);

router.get('/stats', getSellerStats);
router.get('/products', getMyProducts);
router.post('/products', uploadImage.single('image'), createMyProduct);
router.put('/products/:id', uploadImage.single('image'), updateMyProduct);
router.delete('/products/:id', deleteMyProduct);

export default router;
