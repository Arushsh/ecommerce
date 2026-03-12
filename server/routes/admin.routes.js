import express from 'express';
import { protect, adminOnly } from '../middleware/auth.middleware.js';
import { getStats, getAllUsers, changeUserRole, deleteUser } from '../controllers/admin.controller.js';
import { getAllProducts, createProduct, updateProduct, deleteProduct } from '../controllers/product.controller.js';
import { getAllOrders, updateOrderStatus } from '../controllers/order.controller.js';
import { uploadImage } from '../middleware/upload.middleware.js';

const router = express.Router();

// All admin routes require authentication + admin role
router.use(protect, adminOnly);

// Stats
router.get('/stats', getStats);

// User management
router.get('/users', getAllUsers);
router.put('/users/:id/role', changeUserRole);
router.delete('/users/:id', deleteUser);

// Product management (reuse existing controllers)
router.get('/products', getAllProducts);
router.post('/products', uploadImage.single('image'), createProduct);
router.put('/products/:id', uploadImage.single('image'), updateProduct);
router.delete('/products/:id', deleteProduct);

// Order management (reuse existing controllers)
router.get('/orders', getAllOrders);
router.put('/orders/:id/status', updateOrderStatus);

export default router;
