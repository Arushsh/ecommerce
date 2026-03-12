import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { getCart, addToCart, plusCart, minusCart, removeFromCart, clearCart } from '../controllers/cart.controller.js';

const router = express.Router();

router.use(protect); // All cart routes require auth

router.get('/', getCart);
router.post('/', addToCart);
router.put('/:productId/plus', plusCart);
router.put('/:productId/minus', minusCart);
router.delete('/:productId', removeFromCart);
router.delete('/', clearCart);

export default router;
