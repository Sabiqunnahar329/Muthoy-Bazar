import Order, { Counter, STATUSES } from '../models/Order.js';
import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';
import { asyncHandler, err, PHONE, escapeRegex } from '../utils/helpers.js';
import { applyCoupon } from './couponController.js';
import { sendSms } from '../utils/sms.js';
import { notify } from '../utils/notify.js';
import { normIp } from '../middleware/blocklist.js';
import PixelEvent from '../models/PixelEvent.js';

// Delivery charge: 80 BDT when the city or address mentions Dhaka (English or Bangla), otherwise 150 BDT.
// Always worked out here, so a changed price sent from the browser is ignored.
export const DELIVERY = { inside: 80, outside: 150 };
export const mentionsDhaka = (text) => /dhaka|ঢাকা/i.test(text || '');
export const deliveryFor = (customer = {}) => {
  const zone = mentionsDhaka(`${customer.city || ''} ${customer.address || ''}`) ? 'inside' : 'outside';
  return { zone, fee: DELIVERY[zone] };
};

export const create = asyncHandler(async (req, res) => {
  const { customer = {}, items = [], paymentMethod = 'COD', senderNumber = '', trxId = '', couponCode } = req.body;
  if (!customer.name?.trim()) throw err(400, 'Enter your name');
  if (!PHONE.test(customer.phone || '')) throw err(400, 'Enter a valid 11-digit phone number');
  if ((customer.address || '').trim().length < 8) throw err(400, 'Enter your full delivery address');
  if (!Array.isArray(items) || !items.length) throw err(400, 'Your cart is empty');
  if (!['COD', 'bKash', 'Nagad'].includes(paymentMethod)) throw err(400, 'Choose a payment method');
  if (paymentMethod !== 'COD' && (!PHONE.test(senderNumber) || !trxId.trim())) throw err(400, 'Enter the sender number and transaction ID');

  const city = String(customer.city || '').trim().slice(0, 60);
  const address = customer.address.trim();
  const { zone, fee: shippingFee } = deliveryFor({ city, address });

  const taken = [];
  const low = [];
  try {
    const lines = [];
    for (const it of items) {
      const qty = Math.max(1, parseInt(it.qty) || 1);
      // Atomic stock deduction: fails if there is not enough stock.
      const p = await Product.findOneAndUpdate({ _id: it.product, stock: { $gte: qty } }, { $inc: { stock: -qty } }, { new: true });
      if (!p) {
        const cur = await Product.findById(it.product);
        throw err(400, cur ? `Only ${cur.stock} left of ${cur.name}` : 'A product in your cart is no longer available');
      }
      taken.push({ id: p._id, qty });
      if (p.stock < 10) low.push(p);
      lines.push({ product: p._id, name: p.name, image: p.images[0] || '', price: p.discountPrice || p.price, qty });
    }
    const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0);
    let discount = 0;
    let code;
    if (couponCode) {
      const r = await applyCoupon(couponCode, subtotal);
      discount = r.discount;
      code = r.coupon.code;
    }
    const { seq } = await Counter.findOneAndUpdate({ _id: 'order' }, { $inc: { seq: 1 } }, { upsert: true, new: true });
    const cancelled = await Order.countDocuments({ 'customer.phone': customer.phone, status: 'Cancelled' });
    const order = await Order.create({
      orderNumber: `MB${1000 + seq}`,
      user: req.user?._id,
      customer: { name: customer.name.trim(), phone: customer.phone, city, address },
      zone, items: lines, subtotal, shippingFee, discount, couponCode: code,
      total: subtotal - discount + shippingFee,
      paymentMethod, senderNumber, trxId: trxId.trim(),
      flagged: cancelled >= 2, // fraud check: repeated cancelled orders from this phone
      ip: normIp(req.ip),
    });
    PixelEvent.create({ event: 'Purchase', value: order.total, currency: 'BDT' }).catch((error) => {
      console.error('Could not record purchase analytics:', error.message);
    });
    if (code) await Coupon.updateOne({ code }, { $inc: { usedCount: 1 } });
    sendSms(order.customer.phone, `Muthoy Bazar: order ${order.orderNumber} received. Total ৳${order.total}. Thank you!`);
    notify({ type: 'order', title: `New order ${order.orderNumber}`, message: `${order.customer.name} · ৳${order.total} · ${order.paymentMethod}`, link: '/admin/sales' });
    low.forEach((p) => notify({ type: 'stock', title: `Low stock: ${p.name}`, message: `Only ${p.stock} left`, link: '/admin/stock' }));
    res.status(201).json(order);
  } catch (e) {
    await Promise.all(taken.map((t) => Product.updateOne({ _id: t.id }, { $inc: { stock: t.qty } })));
    throw e;
  }
});

export const track = asyncHandler(async (req, res) => {
  const o = await Order.findOne({ orderNumber: String(req.params.number).toUpperCase() });
  if (!o) throw err(404, 'No order found with this ID');
  res.json({ orderNumber: o.orderNumber, status: o.status, createdAt: o.createdAt });
});

export const mine = asyncHandler(async (req, res) => res.json(await Order.find({ user: req.user._id }).sort('-createdAt')));

export const list = asyncHandler(async (req, res) => {
  const { status, search, zone, page = 1, limit = 20 } = req.query;
  const q = {};
  if (STATUSES.includes(status)) q.status = status;
  if (['inside', 'outside'].includes(zone)) q.zone = zone; // delivery area: Dhaka or outside Dhaka
  if (search) {
    const rx = new RegExp(escapeRegex(search), 'i');
    q.$or = [{ orderNumber: rx }, { 'customer.name': rx }, { 'customer.phone': rx }, { 'customer.city': rx }];
  }
  const lim = Math.min(parseInt(limit) || 20, 100);
  const pg = Math.max(parseInt(page) || 1, 1);
  const [orders, total] = await Promise.all([Order.find(q).sort('-createdAt').skip((pg - 1) * lim).limit(lim), Order.countDocuments(q)]);
  res.json({ orders, total, page: pg, pages: Math.ceil(total / lim) });
});

export const getOne = asyncHandler(async (req, res) => {
  const o = await Order.findById(req.params.id);
  if (!o) throw err(404, 'Order not found');
  res.json(o);
});

export const setStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!STATUSES.includes(status)) throw err(400, 'Invalid status');
  const o = await Order.findById(req.params.id);
  if (!o) throw err(404, 'Order not found');
  const wasCancelled = o.status === 'Cancelled';
  if (status === 'Cancelled' && !wasCancelled) await Promise.all(o.items.map((i) => Product.updateOne({ _id: i.product }, { $inc: { stock: i.qty } })));
  if (wasCancelled && status !== 'Cancelled') await Promise.all(o.items.map((i) => Product.updateOne({ _id: i.product }, { $inc: { stock: -i.qty } })));
  o.status = status;
  await o.save();
  sendSms(o.customer.phone, `Muthoy Bazar: your order ${o.orderNumber} is now ${status}.`);
  res.json(o);
});
