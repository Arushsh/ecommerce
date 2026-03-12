import express from 'express';
import { protect, adminOnly } from '../middleware/auth.middleware.js';
import { upload } from '../config/cloudinary.js';
import {
    getAllProducts, getProductById, createProduct, updateProduct, deleteProduct
} from '../controllers/product.controller.js';

const router = express.Router();

router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.post('/', protect, adminOnly, upload.single('image'), createProduct);
router.put('/:id', protect, adminOnly, upload.single('image'), updateProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);

export default router;
