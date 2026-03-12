import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        amount: { type: Number, required: true },
        razorpayOrderId: { type: String, unique: true },
        razorpayPaymentId: { type: String },
        razorpaySignature: { type: String },
        razorpayPaymentStatus: { type: String, default: 'created' },
        paid: { type: Boolean, default: false },
    },
    { timestamps: true }
);

export default mongoose.model('Payment', paymentSchema);
