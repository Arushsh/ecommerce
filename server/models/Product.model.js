import mongoose from 'mongoose';

const CATEGORY_MAP = {
    CR: 'Curd',
    ML: 'Milk',
    LS: 'Lassi',
    MS: 'Milkshake',
    PN: 'Paneer',
    GH: 'Ghee',
    CZ: 'Cheese',
    IC: 'Ice Cream',
    OT: 'Other',
};

const productSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Product title is required'],
            trim: true,
            maxlength: 100,
        },
        sellingPrice: {
            type: Number,
            required: true,
            min: 0,
        },
        discountedPrice: {
            type: Number,
            required: true,
            min: 0,
        },
        description: {
            type: String,
            required: true,
        },
        composition: {
            type: String,
            default: '',
        },
        prodapp: {
            type: String,
            default: '',
        },
        category: {
            type: String,
            enum: Object.keys(CATEGORY_MAP),
            required: true,
        },
        imageUrl: {
            type: String,
            required: true,
        },
        imagePublicId: {
            type: String,  // Cloudinary public_id for deletion
        },
        inStock: {
            type: Boolean,
            default: true,
        },
        sellerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,   // null = added by admin
        },
    },
    { timestamps: true }
);

// Virtual for category label
productSchema.virtual('categoryLabel').get(function () {
    return CATEGORY_MAP[this.category] || this.category;
});

productSchema.set('toJSON', { virtuals: true });

export default mongoose.model('Product', productSchema);
