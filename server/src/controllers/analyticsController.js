import mongoose from 'mongoose';
import PixelEvent from '../models/PixelEvent.js';
import { asyncHandler, err } from '../utils/helpers.js';

const TRACKABLE_EVENTS = ['PageView', 'ViewContent', 'AddToCart', 'InitiateCheckout'];
const EVENT_FIELDS = {
  PageView: 'pageViews',
  ViewContent: 'productViews',
  AddToCart: 'addToCarts',
  InitiateCheckout: 'checkouts',
  Purchase: 'purchases',
};

export const recordEvent = asyncHandler(async (req, res) => {
  const { event, product, path: pagePath } = req.body;
  if (!TRACKABLE_EVENTS.includes(event)) throw err(400, 'Unsupported analytics event');
  if (product && !mongoose.isValidObjectId(product)) throw err(400, 'Invalid product');
  if (pagePath != null && (typeof pagePath !== 'string' || !pagePath.startsWith('/') || pagePath.length > 200)) {
    throw err(400, 'Invalid page path');
  }

  await PixelEvent.create({
    event,
    product: product || undefined,
    path: pagePath ? pagePath.split('?')[0] : '',
  });
  res.status(202).json({ accepted: true });
});

export const pixelStats = asyncHandler(async (req, res) => {
  const since = new Date();
  since.setDate(since.getDate() - 29);
  since.setHours(0, 0, 0, 0);
  const rows = await PixelEvent.aggregate([
    { $match: { createdAt: { $gte: since } } },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          event: '$event',
        },
        count: { $sum: 1 },
        revenue: { $sum: { $cond: [{ $eq: ['$event', 'Purchase'] }, { $ifNull: ['$value', 0] }, 0] } },
      },
    },
  ]);

  const byDay = new Map();
  const summary = { pageViews: 0, productViews: 0, addToCarts: 0, checkouts: 0, purchases: 0, revenue: 0 };
  for (const row of rows) {
    const field = EVENT_FIELDS[row._id.event];
    if (!field) continue;
    const day = byDay.get(row._id.date) || { date: row._id.date, ...Object.fromEntries(Object.values(EVENT_FIELDS).map((key) => [key, 0])), revenue: 0 };
    day[field] = row.count;
    day.revenue = Math.round((day.revenue + row.revenue) * 100) / 100;
    byDay.set(row._id.date, day);
    summary[field] += row.count;
    summary.revenue = Math.round((summary.revenue + row.revenue) * 100) / 100;
  }

  const daily = Array.from({ length: 30 }, (_, index) => {
    const day = new Date(since);
    day.setDate(since.getDate() + index);
    const key = day.toISOString().slice(0, 10);
    return byDay.get(key) || { date: key, ...Object.fromEntries(Object.values(EVENT_FIELDS).map((field) => [field, 0])), revenue: 0 };
  });

  res.json({ summary, daily });
});
