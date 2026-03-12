import crypto from 'crypto';
import Razorpay from 'razorpay';
import Cart from '../models/Cart.model.js';
import Payment from '../models/Payment.model.js';
import Order from '../models/Order.model.js';
import Customer from '../models/Customer.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// POST /api/payment/create-order
export const createOrder = asyncHandler(async (req, res) => {
    const cartItems = await Cart.find({ userId: req.user._id }).populate('productId');
    if (cartItems.length === 0) {
        return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

    const subtotal = cartItems.reduce((sum, item) => sum + item.quantity * item.productId.discountedPrice, 0);
    const totalAmount = subtotal + 40; // delivery charge
    const amountInPaise = Math.round(totalAmount * 100);

    const razorpayOrder = await razorpay.orders.create({
        amount: amountInPaise,
        currency: 'INR',
        receipt: `rcpt_${Date.now()}`,
    });

    const payment = await Payment.create({
        userId: req.user._id,
        amount: totalAmount,
        razorpayOrderId: razorpayOrder.id,
        razorpayPaymentStatus: razorpayOrder.status,
    });

    res.json({
        success: true,
        orderId: razorpayOrder.id,
        amount: amountInPaise,
        currency: 'INR',
        keyId: process.env.RAZORPAY_KEY_ID,
        paymentDocId: payment._id,
    });
});

// POST /api/payment/verify
export const verifyPayment = asyncHandler(async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, addressId } = req.body;

    // 1. Verify signature using HMAC-SHA256
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body)
        .digest('hex');

    if (expectedSignature !== razorpay_signature) {
        return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }

    // 2. Update Payment record
    const payment = await Payment.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id },
        { razorpayPaymentId: razorpay_payment_id, razorpaySignature: razorpay_signature, paid: true, razorpayPaymentStatus: 'paid' },
        { new: true }
    );
    if (!payment) return res.status(404).json({ success: false, message: 'Payment record not found' });

    // 3. Fetch cart + address
    const cartItems = await Cart.find({ userId: req.user._id }).populate('productId');
    const address = await Customer.findOne({ _id: addressId, userId: req.user._id });
    if (!address) return res.status(404).json({ success: false, message: 'Address not found' });

    // 4. Create Order with embedded snapshots
    const orderItems = cartItems.map((item) => ({
        productSnapshot: {
            productId: item.productId._id,
            title: item.productId.title,
            imageUrl: item.productId.imageUrl,
            discountedPrice: item.productId.discountedPrice,
            category: item.productId.category,
        },
        quantity: item.quantity,
    }));

    const order = await Order.create({
        userId: req.user._id,
        paymentId: payment._id,
        items: orderItems,
        addressSnapshot: {
            name: address.name,
            locality: address.locality,
            city: address.city,
            state: address.state,
            zipcode: address.zipcode,
            mobile: address.mobile,
        },
        totalAmount: payment.amount,
    });

    // 5. Clear cart
    await Cart.deleteMany({ userId: req.user._id });

    res.json({ success: true, message: 'Payment verified, order placed', orderId: order._id });
});
