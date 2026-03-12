import Product from '../models/Product.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { cloudinary } from '../config/cloudinary.js';
import Order from '../models/Order.model.js';

// GET /api/seller/products — own products only
export const getMyProducts = asyncHandler(async (req, res) => {
    const products = await Product.find({ sellerId: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, products });
});

// POST /api/seller/products
export const createMyProduct = asyncHandler(async (req, res) => {
    const { title, sellingPrice, discountedPrice, description, composition, prodapp, category } = req.body;
    if (!req.file) return res.status(400).json({ success: false, message: 'Product image is required' });

    const product = await Product.create({
        title, sellingPrice, discountedPrice, description, composition, prodapp, category,
        imageUrl: req.file.path,
        imagePublicId: req.file.filename,
        sellerId: req.user._id,
    });
    res.status(201).json({ success: true, product });
});

// PUT /api/seller/products/:id
export const updateMyProduct = asyncHandler(async (req, res) => {
    let product = await Product.findOne({ _id: req.params.id, sellerId: req.user._id });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found or not yours' });

    if (req.file) {
        if (product.imagePublicId) await cloudinary.uploader.destroy(product.imagePublicId);
        req.body.imageUrl = req.file.path;
        req.body.imagePublicId = req.file.filename;
    }
    product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ success: true, product });
});

// DELETE /api/seller/products/:id
export const deleteMyProduct = asyncHandler(async (req, res) => {
    const product = await Product.findOne({ _id: req.params.id, sellerId: req.user._id });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found or not yours' });
    if (product.imagePublicId) await cloudinary.uploader.destroy(product.imagePublicId);
    await product.deleteOne();
    res.json({ success: true, message: 'Product deleted' });
});

// GET /api/seller/stats
export const getSellerStats = asyncHandler(async (req, res) => {
    const products = await Product.find({ sellerId: req.user._id });
    const productIds = products.map((p) => p._id.toString());

    const orders = await Order.find();
    let sellerRevenue = 0;
    let sellerOrders = 0;
    orders.forEach((order) => {
        const hasMyProduct = order.items.some((item) =>
            productIds.includes(item.productSnapshot.productId?.toString())
        );
        if (hasMyProduct) {
            sellerOrders++;
            sellerRevenue += order.totalAmount;
        }
    });

    res.json({
        success: true,
        stats: {
            totalProducts: products.length,
            totalOrders: sellerOrders,
            estimatedRevenue: sellerRevenue,
        },
    });
});
