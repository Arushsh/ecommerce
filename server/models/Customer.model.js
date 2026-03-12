import mongoose from 'mongoose';

const STATES = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana',
    'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Andaman and Nicobar Islands', 'Chandigarh',
    'Dadra and Nagar Haveli and Daman and Diu', 'Lakshadweep',
    'Delhi', 'Puducherry', 'Ladakh', 'Jammu and Kashmir',
];

const customerSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        name: { type: String, required: true, maxlength: 200 },
        locality: { type: String, required: true, maxlength: 200 },
        city: { type: String, required: true, maxlength: 50 },
        mobile: { type: String, required: true },
        zipcode: { type: String, required: true },
        state: { type: String, enum: STATES, required: true },
    },
    { timestamps: true }
);

export default mongoose.model('Customer', customerSchema);
