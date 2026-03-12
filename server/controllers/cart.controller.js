import Cart from '../models/Cart.model.js';
import Product from '../models/Product.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const getCartWithTotal = async (userId) => {
    const items = await Cart.find({ userId }).populate('productId');
    const subtotal = items.reduce((sum, item) => sum + item.quantity * item.productId.discountedPrice, 0);
    const delivery = items.length > 0 ? 40 : 0;
    return { items, subtotal, delivery, total: subtotal + delivery };
};

// GET /api/cart
export const getCart = asyncHandler(async (req, res) => {
    const data = await getCartWithTotal(req.user._id);
    res.json({ success: true, ...data });
});

// POST /api/cart
export const addToCart = asyncHandler(async (req, res) => {
    const { productId } = req.body;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    // upsert — if already exists, just return existing
    const item = await Cart.findOneAndUpdate(
        { userId: req.user._id, productId },
        { $setOnInsert: { userId: req.user._id, productId, quantity: 1 } },
        { upsert: true, new: true }
    ).populate('productId');

    const data = await getCartWithTotal(req.user._id);
    res.status(201).json({ success: true, item, ...data });
});

// PUT /api/cart/:productId/plus
export const plusCart = asyncHandler(async (req, res) => {
    const item = await Cart.findOneAndUpdate(
        { userId: req.user._id, productId: req.params.productId },
        { $inc: { quantity: 1 } },
        { new: true }
    ).populate('productId');
    if (!item) return res.status(404).json({ success: false, message: 'Cart item not found' });
    const data = await getCartWithTotal(req.user._id);
    res.json({ success: true, item, ...data });
});

// PUT /api/cart/:productId/minus
export const minusCart = asyncHandler(async (req, res) => {
    const item = await Cart.findOne({ userId: req.user._id, productId: req.params.productId });
    if (!item) return res.status(404).json({ success: false, message: 'Cart item not found' });
    if (item.quantity <= 1) {
        await item.deleteOne();
        const data = await getCartWithTotal(req.user._id);
        return res.json({ success: true, item: null, ...data });
    }
    item.quantity -= 1;
    await item.save();
    await item.populate('productId');
    const data = await getCartWithTotal(req.user._id);
    res.json({ success: true, item, ...data });
});

// DELETE /api/cart/:productId
export const removeFromCart = asyncHandler(async (req, res) => {
    await Cart.findOneAndDelete({ userId: req.user._id, productId: req.params.productId });
    const data = await getCartWithTotal(req.user._id);
    res.json({ success: true, ...data });
});

// DELETE /api/cart (clear entire cart)
export const clearCart = asyncHandler(async (req, res) => {
    await Cart.deleteMany({ userId: req.user._id });
    res.json({ success: true, message: 'Cart cleared' });
});
