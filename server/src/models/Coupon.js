import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    type: { type: String, enum: ['percent', 'fixed'], required: true },
    value: { type: Number, required: true, min: 1 },
    minCart: { type: Number, default: 0 },
    expiresAt: { type: Date },
    active: { type: Boolean, default: true },
    usedCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);
export default mongoose.model('Coupon', couponSchema);
