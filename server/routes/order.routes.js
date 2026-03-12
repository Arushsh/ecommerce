import express from 'express';
import { protect, adminOnly } from '../middleware/auth.middleware.js';
import { getMyOrders, getOrderById, updateOrderStatus, getAllOrders } from '../controllers/order.controller.js';

const router = express.Router();

router.use(protect);

router.get('/', getMyOrders);
router.get('/admin/all', adminOnly, getAllOrders);
router.get('/:id', getOrderById);
router.put('/:id/status', adminOnly, updateOrderStatus);

export default router;
