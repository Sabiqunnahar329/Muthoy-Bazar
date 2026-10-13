import crypto from 'crypto';
import Order, { Counter, STATUSES } from '../models/Order.js';
import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';
import { asyncHandler, err, PHONE, escapeRegex } from '../utils/helpers.js';
import { applyCoupon } from './couponController.js';
import CustomerNotification from '../models/CustomerNotification.js';
import { notify, notifyCustomer } from '../utils/notify.js';
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

const customerAccessHash = (token) => (
  typeof token === 'string' && /^[a-f\d]{64}$/i.test(token)
    ? crypto.createHash('sha256').update(token.toLowerCase()).digest('hex')
    : null
);

const reviewTokenFor = (order) => crypto.createHmac('sha256', process.env.JWT_SECRET)
  .update(`${order._id}:${order.customerAccessTokenHash}`)
  .digest('hex');

const customerOrdersQuery = (userId, accessCodes = []) => {
  const options = [];
  if (userId) options.push({ user: userId });
  const hashes = [...new Set((Array.isArray(accessCodes) ? accessCodes : [])
    .slice(0, 50)
    .map(customerAccessHash)
    .filter(Boolean))];
  if (hashes.length) options.push({ customerAccessTokenHash: { $in: hashes } });
  return options.length ? { $or: options } : null;
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
    const customerAccessToken = crypto.randomBytes(32).toString('hex');
    const order = await Order.create({
      orderNumber: `MB${1000 + seq}`,
      user: req.user?._id,
      customerAccessTokenHash: crypto.createHash('sha256').update(customerAccessToken).digest('hex'),
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
    notifyCustomer({
      user: order.user,
      order: order._id,
      title: `Order ${order.orderNumber} received`,
      message: `Your order has been placed. Total: ৳${order.total}.`,
      link: `/track/${order.orderNumber}`,
    });
    notify({ type: 'order', title: `New order ${order.orderNumber}`, message: `${order.customer.name} · ৳${order.total} · ${order.paymentMethod}`, link: '/admin/sales' });
    low.forEach((p) => notify({ type: 'stock', title: `Low stock: ${p.name}`, message: `Only ${p.stock} left`, link: '/admin/stock' }));
    res.status(201).json({ ...order.toObject(), customerAccessToken });
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

export const customerNotifications = asyncHandler(async (req, res) => {
  const query = customerOrdersQuery(req.user?._id, req.body.accessCodes);
  if (!query) return res.json([]);
  const orders = await Order.find(query).select('_id');
  const notifications = await CustomerNotification.find({ order: { $in: orders.map((order) => order._id) } })
    .sort('-createdAt')
    .limit(100)
    .lean();
  res.json(notifications);
});

export const markCustomerNotificationRead = asyncHandler(async (req, res) => {
  const notification = await CustomerNotification.findById(req.params.id);
  if (!notification) throw err(404, 'Notification not found');
  const query = customerOrdersQuery(req.user?._id, req.body.accessCodes);
  if (!query || !(await Order.exists({ _id: notification.order, ...query }))) throw err(404, 'Notification not found');
  notification.read = true;
  await notification.save();
  res.json(notification);
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
  const o = await Order.findById(req.params.id).select('+customerAccessTokenHash');
  if (!o) throw err(404, 'Order not found');
  const previousStatus = o.status;
  const wasCancelled = o.status === 'Cancelled';
  if (status === 'Cancelled' && !wasCancelled) await Promise.all(o.items.map((i) => Product.updateOne({ _id: i.product }, { $inc: { stock: i.qty } })));
  if (wasCancelled && status !== 'Cancelled') await Promise.all(o.items.map((i) => Product.updateOne({ _id: i.product }, { $inc: { stock: -i.qty } })));
  o.status = status;
  let notificationLink = `/track/${o.orderNumber}`;
  if (status === 'Delivered' && previousStatus !== status && o.customerAccessTokenHash) {
    const token = reviewTokenFor(o);
    o.reviewTokenHash = crypto.createHash('sha256').update(token).digest('hex');
    notificationLink = `/review/${token}`;
  }
  await o.save();
  if (status !== previousStatus) {
    const delivered = status === 'Delivered';
    notifyCustomer({
      user: o.user,
      order: o._id,
      title: delivered ? `Order ${o.orderNumber} delivered` : `Order ${o.orderNumber} ${status.toLowerCase()}`,
      message: delivered ? 'Your order has been delivered. Please rate and review your items.' : `Your order status is now ${status}.`,
      link: notificationLink,
    });
  }
  res.json(o);
});

const reviewOrderView = (order) => ({
  orderNumber: order.orderNumber,
  status: order.status,
  items: order.items.map((item) => ({
    product: item.product.toString(),
    name: item.name,
    image: item.image,
    reviewed: !!item.reviewedAt,
  })),
});

const findReviewOrderByToken = async (token) => {
  if (!/^[a-f\d]{64}$/i.test(token)) return null;
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  return Order.findOne({ reviewTokenHash: tokenHash }).select('+reviewTokenHash');
};

export const getReviewOrder = asyncHandler(async (req, res) => {
  const order = await findReviewOrderByToken(req.params.token);
  if (!order) throw err(404, 'This feedback link is invalid or has expired');
  if (order.status !== 'Delivered') throw err(409, 'Feedback is available after your order is delivered');
  res.json(reviewOrderView(order));
});

export const submitOrderReview = asyncHandler(async (req, res) => {
  const order = await findReviewOrderByToken(req.params.token);
  if (!order) throw err(404, 'This feedback link is invalid or has expired');
  if (order.status !== 'Delivered') throw err(409, 'Feedback is available after your order is delivered');

  const productId = String(req.body.product || '');
  const item = order.items.find((line) => line.product.toString() === productId);
  if (!item) throw err(404, 'This product is not part of your order');
  if (item.reviewedAt) throw err(409, 'You already rated this product');

  const rating = Number(req.body.rating);
  const reviewText = String(req.body.review || '').trim();
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) throw err(400, 'Choose a rating from 1 to 5');
  if (reviewText.length > 500) throw err(400, 'Review must be 500 characters or less');

  const product = await Product.findById(item.product);
  if (!product) throw err(404, 'This product is no longer available');
  if (!product.reviews.some((review) => review.order?.toString() === order._id.toString())) {
    product.reviews.push({
      order: order._id,
      user: order.user,
      name: order.customer.name,
      rating,
      review: reviewText,
    });
    await product.save();
  }

  item.reviewedAt = new Date();
  item.reviewRating = rating;
  item.reviewText = reviewText;
  await order.save();
  res.json({ product: productId, reviewed: true });
});
