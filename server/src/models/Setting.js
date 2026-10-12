import mongoose from 'mongoose';

const settingSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'main', unique: true },
    storeName: { type: String, default: 'Muthoy Bazar' },
    currency: { type: String, default: '৳' },
    taxRate: { type: Number, default: 0, min: 0, max: 100 },
    phone: { type: String, default: '+880 1612-633433' },
    whatsapp: { type: String, default: '+880 1612-633433' },
    email: { type: String, default: '' },
    address: { type: String, default: 'মেসার্স আব্দুল লতিফ স্টোর, শ্যামবাজার, ঢাকা, বাংলাদেশ' },
    announcementEnabled: { type: Boolean, default: false },
    announcement: { type: String, default: '' },
    heroTitle: { type: String, default: 'সাধ্যের মধ্যে স্বস্তির বাজার' },
    heroText: { type: String, default: 'Rice, oil, spices and daily needs from trusted brands. Cash on delivery across Bangladesh.' },
    heroCta: { type: String, default: 'Shop the offer zone' },
    heroLink: { type: String, default: '/shop?flag=offer' },
    heroImage: { type: String, default: '/banners/slide-1.jpg' },
  },
  { timestamps: true }
);
export default mongoose.model('Setting', settingSchema);
