import Product from '../models/Product.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { cloudinary } from '../config/cloudinary.js';

// GET /api/products
export const getAllProducts = asyncHandler(async (req, res) => {
    const { category, search, page = 1, limit = 20 } = req.query;
    const query = {};
    if (category) query.category = category;
    if (search) query.title = { $regex: search, $options: 'i' };

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .sort({ createdAt: -1 });

    res.json({ success: true, total, page: Number(page), products });
});

// GET /api/products/:id
export const getProductById = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, product });
});

// POST /api/products (admin)
export const createProduct = asyncHandler(async (req, res) => {
    const { title, sellingPrice, discountedPrice, description, composition, prodapp, category } = req.body;
    if (!req.file) return res.status(400).json({ success: false, message: 'Product image is required' });

    const product = await Product.create({
        title, sellingPrice, discountedPrice, description, composition, prodapp, category,
        imageUrl: req.file.path,
        imagePublicId: req.file.filename,
    });
    res.status(201).json({ success: true, product });
});

// PUT /api/products/:id (admin)
export const updateProduct = asyncHandler(async (req, res) => {
    let product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    if (req.file) {
        // Delete old image from Cloudinary
        if (product.imagePublicId) await cloudinary.uploader.destroy(product.imagePublicId);
        req.body.imageUrl = req.file.path;
        req.body.imagePublicId = req.file.filename;
    }
    product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ success: true, product });
});

// DELETE /api/products/:id (admin)
export const deleteProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    if (product.imagePublicId) await cloudinary.uploader.destroy(product.imagePublicId);
    await product.deleteOne();
    res.json({ success: true, message: 'Product deleted' });
});
