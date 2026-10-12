import Coupon from '../models/Coupon.js';
import { asyncHandler, err } from '../utils/helpers.js';

// Returns the discount in BDT for a cart subtotal, or throws a friendly error.
export async function applyCoupon(code, subtotal) {
  const c = await Coupon.findOne({ code: String(code).trim().toUpperCase(), active: true });
  if (!c) throw err(400, 'This coupon code is not valid');
  if (c.expiresAt && c.expiresAt < new Date()) throw err(400, 'This coupon has expired');
  if (subtotal < c.minCart) throw err(400, `Spend at least ৳${c.minCart} to use this coupon`);
  const discount = c.type === 'percent' ? Math.round((subtotal * c.value) / 100) : c.value;
  return { coupon: c, discount: Math.min(discount, subtotal) };
}

export const validate = asyncHandler(async (req, res) => {
  const { discount, coupon } = await applyCoupon(req.body.code || '', Number(req.body.subtotal) || 0);
  res.json({ code: coupon.code, discount });
});

export const list = asyncHandler(async (req, res) => res.json(await Coupon.find().sort('-createdAt')));

export const create = asyncHandler(async (req, res) => {
  const { code, type, value, minCart, expiresAt } = req.body;
  if (!code?.trim()) throw err(400, 'Enter a coupon code');
  if (!['percent', 'fixed'].includes(type)) throw err(400, 'Choose percentage or fixed');
  if (!(Number(value) > 0) || (type === 'percent' && Number(value) > 100)) throw err(400, 'Enter a valid discount value');
  res.status(201).json(await Coupon.create({ code, type, value: Number(value), minCart: Number(minCart) || 0, expiresAt: expiresAt || undefined }));
});

export const remove = asyncHandler(async (req, res) => {
  await Coupon.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});
