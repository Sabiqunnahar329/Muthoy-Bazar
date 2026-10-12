import Order from '../models/Order.js';
import Blacklist from '../models/Blacklist.js';
import { asyncHandler, err, PHONE } from '../utils/helpers.js';
import { loadBlocklist, normIp } from '../middleware/blocklist.js';

const IP = /^((\d{1,3}\.){3}\d{1,3}|[0-9a-f:]{2,39})$/i;

const phoneRisk = (s, blocked) => {
  if (blocked) return 'Blocked';
  if (s.cancelled >= 3 || (s.orders >= 2 && s.cancelled / s.orders >= 0.5)) return 'High';
  return s.cancelled >= 1 ? 'Medium' : 'Low';
};

// Look up the order history of a phone number or an IP address
export const lookup = asyncHandler(async (req, res) => {
  const { phone, ip } = req.query;
  if (phone) {
    if (!PHONE.test(phone)) throw err(400, 'Enter an 11-digit phone number starting with 01');
    const orders = await Order.find({ 'customer.phone': phone }).sort('-createdAt').limit(100);
    const n = (st) => orders.filter((o) => st.includes(o.status)).length;
    const stats = { orders: orders.length, delivered: n(['Delivered']), cancelled: n(['Cancelled']), open: n(['Pending', 'Processing', 'Shipped']), spent: orders.filter((o) => o.status !== 'Cancelled').reduce((a, o) => a + o.total, 0) };
    const blocked = await Blacklist.findOne({ type: 'phone', value: phone });
    return res.json({ kind: 'phone', value: phone, blocked, stats, risk: phoneRisk(stats, blocked), recent: orders.slice(0, 5) });
  }
  if (ip) {
    const v = normIp(ip).trim();
    if (!IP.test(v)) throw err(400, 'Enter a valid IP address');
    const orders = await Order.find({ ip: v }).sort('-createdAt').limit(100);
    const phones = new Set(orders.map((o) => o.customer.phone));
    const stats = { orders: orders.length, phones: phones.size, cancelled: orders.filter((o) => o.status === 'Cancelled').length };
    const blocked = await Blacklist.findOne({ type: 'ip', value: v });
    const risk = blocked ? 'Blocked' : phones.size >= 4 ? 'High' : phones.size >= 2 || stats.cancelled >= 2 ? 'Medium' : 'Low';
    return res.json({ kind: 'ip', value: v, blocked, stats, risk, recent: orders.slice(0, 5) });
  }
  throw err(400, 'Enter a phone number or an IP address');
});

export const listBlacklist = asyncHandler(async (req, res) => res.json(await Blacklist.find().sort('-createdAt')));

export const addBlacklist = asyncHandler(async (req, res) => {
  const type = req.body.type;
  const value = type === 'ip' ? normIp(req.body.value).trim() : String(req.body.value || '').trim();
  if (type === 'phone' && !PHONE.test(value)) throw err(400, 'Enter an 11-digit phone number starting with 01');
  if (type === 'ip' && !IP.test(value)) throw err(400, 'Enter a valid IP address');
  if (!['phone', 'ip'].includes(type)) throw err(400, 'Choose phone or IP');
  if (type === 'ip' && value === normIp(req.ip)) throw err(400, 'That is your own IP address. Blocking it could lock you out of the store.');
  const row = await Blacklist.create({ type, value, reason: String(req.body.reason || '').trim(), addedBy: req.user._id });
  await loadBlocklist();
  res.status(201).json(row);
});

export const removeBlacklist = asyncHandler(async (req, res) => {
  await Blacklist.findByIdAndDelete(req.params.id);
  await loadBlocklist();
  res.json({ message: 'Removed' });
});
