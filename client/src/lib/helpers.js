export const money = (n) => `৳${Number(n || 0).toLocaleString('en-US')}`;
export const productName = (product, lang = 'en') => (lang === 'bn' && product?.nameBn ? product.nameBn : product?.name || '');
const LABELS_BN = {
  'Home Features': 'হোম ফিচার', 'Featured Products': 'বিশেষ পণ্য', 'Special Offers': 'বিশেষ অফার',
  'Best Sellers': 'সর্বাধিক বিক্রিত', 'New Arrivals': 'নতুন পণ্য', 'Offer Zone': 'অফার জোন',
  Honey: 'মধু', 'Oil & Ghee': 'তেল ও ঘি', Dates: 'খেজুর', Spices: 'মসলা',
  Beverage: 'পানীয়', Snacks: 'স্ন্যাকস', Rice: 'চাল',
  'Flours & Lentils': 'আটা ও ডাল', 'Personal & Home Care': 'ব্যক্তিগত ও ঘরোয়া পণ্য',
  'Flour & Atta': 'আটা ও ময়দা', Lentils: 'ডাল', 'Cooking Oil': 'রান্নার তেল', Ghee: 'ঘি',
  Salt: 'লবণ', Sugar: 'চিনি', Tea: 'চা', Coffee: 'কফি', 'Milk Powder': 'গুঁড়া দুধ',
  Beverages: 'পানীয়', 'Soft Drinks': 'কোমল পানীয়', 'Mineral Water': 'মিনারেল ওয়াটার',
  Biscuits: 'বিস্কুট', Noodles: 'নুডলস', 'Breakfast Items': 'নাশতার পণ্য',
  'Dry Fruits': 'শুকনো ফল ও বাদাম', Oats: 'ওটস',
  Jam: 'জ্যাম', Jelly: 'জেলি', Pickles: 'আচার', Sauces: 'সস', 'Tomato Ketchup': 'টমেটো কেচাপ',
  Mayonnaise: 'মেয়োনিজ', 'Frozen Food': 'হিমায়িত খাবার', Eggs: 'ডিম', 'Baby Food': 'শিশুখাদ্য',
  'Instant Food': 'ইনস্ট্যান্ট খাবার', Tissue: 'টিস্যু', Soap: 'সাবান', Shampoo: 'শ্যাম্পু',
  Toothpaste: 'টুথপেস্ট', 'Dish Wash': 'থালা-বাসন ধোয়ার পণ্য', Detergent: 'ডিটারজেন্ট',
  'Cleaning Supplies': 'পরিষ্কারের সামগ্রী',
};
export const localizedLabel = (label, lang = 'en') => (lang === 'bn' ? LABELS_BN[label] || label : label);
export const PHONE_RE = /^01[3-9]\d{8}$/;

const EMOJI = { Rice: '🍚', Eggs: '🥚', Tea: '🍵', Coffee: '☕', Honey: '🍯', 'Cooking Oil': '🫒', Spices: '🌶️', Dates: '🌴', 'Mineral Water': '💧', 'Soft Drinks': '🥤', Biscuits: '🍪', Snacks: '🥜', Noodles: '🍜', Soap: '🧼', Toothpaste: '🪥', 'Dry Fruits': '🌰', Salt: '🧂', Sugar: '🍬', 'Frozen Food': '🧊', 'Baby Food': '🍼', Ghee: '🧈', Lentils: '🫘', Beverages: '🧃', Oats: '🥣' };
export const emoji = (name) => EMOJI[name] || '🛒';

export const STATUSES = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
export const statusStyle = {
  Pending: 'bg-amber-100 text-amber-800',
  Processing: 'bg-blue-100 text-blue-800',
  Shipped: 'bg-indigo-100 text-indigo-800',
  Delivered: 'bg-green-100 text-green-800',
  Cancelled: 'bg-red-100 text-red-800',
};
export const fmtDate = (d) => new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
export const apiError = (e, fallback = 'Something went wrong. Please try again.') => e.response?.data?.message || fallback;
