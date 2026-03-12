import Wishlist from '../models/Wishlist.model.js';
import Product from '../models/Product.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// GET /api/wishlist
export const getWishlist = asyncHandler(async (req, res) => {
    const items = await Wishlist.find({ userId: req.user._id }).populate('productId');
    res.json({ success: true, items, count: items.length });
});

// POST /api/wishlist
export const addToWishlist = asyncHandler(async (req, res) => {
    const { productId } = req.body;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const existing = await Wishlist.findOne({ userId: req.user._id, productId });
    if (existing) return res.status(400).json({ success: false, message: 'Already in wishlist' });

    const item = await Wishlist.create({ userId: req.user._id, productId });
    res.status(201).json({ success: true, message: 'Added to wishlist', item });
});

// DELETE /api/wishlist/:productId
export const removeFromWishlist = asyncHandler(async (req, res) => {
    await Wishlist.findOneAndDelete({ userId: req.user._id, productId: req.params.productId });
    res.json({ success: true, message: 'Removed from wishlist' });
});
