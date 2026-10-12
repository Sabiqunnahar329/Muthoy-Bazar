import mongoose from 'mongoose';

const landingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    headline: { type: String, default: '', trim: true },
    subheadline: { type: String, default: '', trim: true },
    bannerUrl: { type: String, default: '' },
    ctaText: { type: String, default: 'Order now' },
    ctaLink: { type: String, default: '#products' },
    sections: [{ heading: { type: String, default: '' }, body: { type: String, default: '' } }],
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    published: { type: Boolean, default: false },
  },
  { timestamps: true }
);
export default mongoose.model('LandingPage', landingSchema);
