import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { createOrder, verifyPayment } from '../controllers/payment.controller.js';

const router = express.Router();

router.use(protect);

router.post('/create-order', createOrder);
router.post('/verify', verifyPayment);

export default router;
