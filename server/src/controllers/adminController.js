import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { asyncHandler } from '../utils/helpers.js';

export const stats = asyncHandler(async (req, res) => {
  const since = new Date();
  since.setDate(since.getDate() - 6);
  since.setHours(0, 0, 0, 0);
  const [rev, orders, pending, lowStock, daily, recent] = await Promise.all([
    Order.aggregate([{ $match: { status: { $ne: 'Cancelled' } } }, { $group: { _id: null, revenue: { $sum: '$total' } } }]),
    Order.countDocuments(),
    Order.countDocuments({ status: 'Pending' }),
    Product.find({ stock: { $lt: 10 } }).sort('stock').limit(10).select('name stock unit weight'),
    Order.aggregate([
      { $match: { createdAt: { $gte: since }, status: { $ne: 'Cancelled' } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, revenue: { $sum: '$total' } } },
    ]),
    Order.find().sort('-createdAt').limit(5),
  ]);
  const byDay = Object.fromEntries(daily.map((d) => [d._id, d.revenue]));
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(since);
    d.setDate(since.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    return { date: key, revenue: byDay[key] || 0 };
  });
  res.json({ revenue: rev[0]?.revenue || 0, orders, pending, lowStockCount: await Product.countDocuments({ stock: { $lt: 10 } }), lowStock, last7, recent });
});

const customerRows = () =>
  Order.aggregate([
    { $sort: { createdAt: 1 } },
    {
      $group: {
        _id: '$customer.phone',
        name: { $last: '$customer.name' },
        address: { $last: '$customer.address' },
        orders: { $sum: 1 },
        spent: { $sum: { $cond: [{ $eq: ['$status', 'Cancelled'] }, 0, '$total'] } },
        cancelled: { $sum: { $cond: [{ $eq: ['$status', 'Cancelled'] }, 1, 0] } },
        lastOrder: { $max: '$createdAt' },
      },
    },
    { $sort: { lastOrder: -1 } },
  ]);

export const customers = asyncHandler(async (req, res) => res.json(await customerRows()));

// CSV of customer phone numbers for SMS marketing
export const exportCustomers = asyncHandler(async (req, res) => {
  const rows = await customerRows();
  const csv = ['Name,Phone,Orders,Total spent', ...rows.map((r) => `"${(r.name || '').replace(/"/g, '""')}",${r._id},${r.orders},${r.spent}`)].join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=customers.csv');
  res.send(csv);
});
