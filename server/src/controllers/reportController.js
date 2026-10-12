import Order from '../models/Order.js';
import Expense from '../models/Expense.js';
import { asyncHandler } from '../utils/helpers.js';

export const reports = asyncHandler(async (req, res) => {
  const months = Math.min(Math.max(parseInt(req.query.months) || 6, 1), 24);
  const now = new Date();
  const keys = [];
  for (let i = months - 1; i >= 0; i--) keys.push(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1)).toISOString().slice(0, 7));
  const from = new Date(`${keys[0]}-01T00:00:00Z`);
  const live = { createdAt: { $gte: from }, status: { $ne: 'Cancelled' } };

  const [sales, exp, top] = await Promise.all([
    Order.aggregate([{ $match: live }, { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, sales: { $sum: '$total' }, orders: { $sum: 1 } } }]),
    Expense.aggregate([{ $match: { type: 'expense', date: { $gte: from } } }, { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$date' } }, expenses: { $sum: '$amount' } } }]),
    Order.aggregate([{ $match: live }, { $unwind: '$items' }, { $group: { _id: '$items.name', qty: { $sum: '$items.qty' }, revenue: { $sum: { $multiply: ['$items.price', '$items.qty'] } } } }, { $sort: { revenue: -1 } }, { $limit: 10 }]),
  ]);
  const s = Object.fromEntries(sales.map((x) => [x._id, x]));
  const e = Object.fromEntries(exp.map((x) => [x._id, x.expenses]));
  const monthly = keys.map((k) => ({ month: k, sales: s[k]?.sales || 0, orders: s[k]?.orders || 0, expenses: e[k] || 0, profit: (s[k]?.sales || 0) - (e[k] || 0) }));
  const sum = (f) => monthly.reduce((a, m) => a + m[f], 0);
  res.json({ monthly, topProducts: top.map((t) => ({ name: t._id, qty: t.qty, revenue: t.revenue })), totals: { sales: sum('sales'), expenses: sum('expenses'), profit: sum('profit'), orders: sum('orders') } });
});
