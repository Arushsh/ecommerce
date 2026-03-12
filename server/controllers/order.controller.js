import Order from '../models/Order.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// GET /api/orders
export const getMyOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({ userId: req.user._id })
        .populate('paymentId', 'razorpayPaymentId paid amount')
        .sort({ createdAt: -1 });
    res.json({ success: true, orders });
});

// GET /api/orders/:id
export const getOrderById = asyncHandler(async (req, res) => {
    const order = await Order.findOne({ _id: req.params.id, userId: req.user._id }).populate('paymentId');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, order });
});

// PUT /api/orders/:id/status (admin)
export const updateOrderStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true, runValidators: true });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, order });
});

// GET /api/orders/admin/all (admin - all orders)
export const getAllOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find()
        .populate('userId', 'username email')
        .populate('paymentId', 'razorpayPaymentId paid amount')
        .sort({ createdAt: -1 });
    res.json({ success: true, count: orders.length, orders });
});
