import User from '../models/User.model.js';
import Product from '../models/Product.model.js';
import Order from '../models/Order.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// GET /api/admin/stats
export const getStats = asyncHandler(async (req, res) => {
    const [totalUsers, totalProducts, orders] = await Promise.all([
        User.countDocuments(),
        Product.countDocuments(),
        Order.find().select('totalAmount status createdAt'),
    ]);

    const totalOrders = orders.length;
    const totalRevenue = orders
        .filter((o) => o.status !== 'Cancel')
        .reduce((sum, o) => sum + o.totalAmount, 0);

    const recentOrders = await Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('userId', 'username email');

    const ordersByStatus = orders.reduce((acc, o) => {
        acc[o.status] = (acc[o.status] || 0) + 1;
        return acc;
    }, {});

    res.json({
        success: true,
        stats: { totalUsers, totalProducts, totalOrders, totalRevenue },
        ordersByStatus,
        recentOrders,
    });
});

// GET /api/admin/users
export const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({ success: true, users });
});

// PUT /api/admin/users/:id/role
export const changeUserRole = asyncHandler(async (req, res) => {
    const { role } = req.body;
    if (!['user', 'seller', 'admin'].includes(role)) {
        return res.status(400).json({ success: false, message: 'Invalid role' });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
});

// DELETE /api/admin/users/:id
export const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: 'User deleted' });
});
