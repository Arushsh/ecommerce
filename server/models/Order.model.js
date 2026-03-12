import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
    // Embedded product snapshot to preserve price at time of order
    productSnapshot: {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        title: String,
        imageUrl: String,
        discountedPrice: Number,
        category: String,
    },
    quantity: { type: Number, required: true, min: 1 },
});

const orderSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        paymentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Payment',
            required: true,
        },
        items: [orderItemSchema],
        // Embedded address snapshot at time of order
        addressSnapshot: {
            name: String,
            locality: String,
            city: String,
            state: String,
            zipcode: String,
            mobile: String,
        },
        status: {
            type: String,
            enum: ['Pending', 'Accepted', 'Packed', 'On the Way', 'Delivered', 'Cancel'],
            default: 'Pending',
        },
        totalAmount: { type: Number, required: true },
    },
    { timestamps: true }
);

export default mongoose.model('Order', orderSchema);
