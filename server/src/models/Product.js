import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    brand: { type: String, default: '', trim: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
    description: { type: String, default: '' },
    images: { type: [String], default: [] },
    price: { type: Number, required: true, min: 1 },
    discountPrice: { type: Number, default: 0, min: 0 },
    effectivePrice: { type: Number, index: true },
    stock: { type: Number, default: 0, min: 0 },
    sku: { type: String, unique: true, sparse: true },
    weight: { type: Number },
    unit: { type: String, default: 'pcs' },
    rating: { type: Number, default: 4 },
    numReviews: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: false },
  },
  { timestamps: true }
);

productSchema.index({ name: 'text', brand: 'text' });
productSchema.pre('save', function (next) {
  this.effectivePrice = this.discountPrice > 0 ? this.discountPrice : this.price;
  next();
});

export default mongoose.model('Product', productSchema);
