import Expense from '../models/Expense.js';
import { asyncHandler, err } from '../utils/helpers.js';

const TYPES = ['income', 'expense'];

const filterFrom = (q) => {
  const f = {};
  if (TYPES.includes(q.type)) f.type = q.type;
  if (q.category) f.category = q.category;
  if (q.from || q.to) {
    f.date = {};
    if (q.from) f.date.$gte = new Date(q.from);
    if (q.to) { const t = new Date(q.to); t.setHours(23, 59, 59, 999); f.date.$lte = t; }
    if (Object.values(f.date).some((d) => isNaN(d))) throw err(400, 'Invalid date filter');
  }
  return f;
};

export const list = asyncHandler(async (req, res) => {
  const f = filterFrom(req.query);
  const [items, sums] = await Promise.all([
    Expense.find(f).sort('-date -createdAt').limit(300),
    Expense.aggregate([{ $match: f }, { $group: { _id: '$type', total: { $sum: '$amount' } } }]),
  ]);
  const t = Object.fromEntries(sums.map((s) => [s._id, s.total]));
  res.json({ items, totals: { income: t.income || 0, expense: t.expense || 0, net: (t.income || 0) - (t.expense || 0) } });
});

const parse = (b) => {
  const d = {
    type: b.type, category: String(b.category || '').trim(), amount: Number(b.amount),
    date: b.date ? new Date(b.date) : new Date(), note: String(b.note || '').trim(),
  };
  if (!TYPES.includes(d.type)) throw err(400, 'Choose income or expense');
  if (!d.category) throw err(400, 'Enter a category');
  if (!(d.amount > 0)) throw err(400, 'Amount must be above 0');
  if (isNaN(d.date)) throw err(400, 'Enter a valid date');
  return d;
};

export const create = asyncHandler(async (req, res) => res.status(201).json(await Expense.create({ ...parse(req.body), createdBy: req.user._id })));

export const update = asyncHandler(async (req, res) => {
  const e = await Expense.findByIdAndUpdate(req.params.id, parse(req.body), { new: true });
  if (!e) throw err(404, 'Entry not found');
  res.json(e);
});

export const remove = asyncHandler(async (req, res) => {
  await Expense.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});
