export const money = (n) => `৳${Number(n || 0).toLocaleString('en-US')}`;
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
