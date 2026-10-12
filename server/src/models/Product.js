import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    name: { type: String, required: true, trim: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    review: { type: String, required: true, trim: true, maxlength: 500 },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    nameBn: { type: String, default: '', trim: true },
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
    reviews: { type: [reviewSchema], default: [] },
    isFeatured: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: false },
  },
  { timestamps: true }
);

productSchema.index({ name: 'text', brand: 'text' });
productSchema.pre('save', function (next) {
  this.effectivePrice = this.discountPrice > 0 ? this.discountPrice : this.price;
  const totalReviews = Array.isArray(this.reviews) ? this.reviews.length : 0;
  if (totalReviews > 0) {
    const totalRating = this.reviews.reduce((sum, review) => sum + (Number(review.rating) || 0), 0);
    this.rating = Number((totalRating / totalReviews).toFixed(1));
    this.numReviews = totalReviews;
  } else {
    this.numReviews = 0;
    this.rating = Number(this.rating || 4);
  }
  next();
});

export default mongoose.model('Product', productSchema);
