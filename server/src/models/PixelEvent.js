import mongoose from 'mongoose';

const pixelEventSchema = new mongoose.Schema(
  {
    event: { type: String, enum: ['PageView', 'ViewContent', 'AddToCart', 'InitiateCheckout', 'Purchase'], required: true, index: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    path: { type: String, default: '', maxlength: 200 },
    value: { type: Number, min: 0 },
    currency: { type: String, default: 'BDT' },
  },
  { timestamps: true }
);

pixelEventSchema.index({ createdAt: -1 });

export default mongoose.model('PixelEvent', pixelEventSchema);
