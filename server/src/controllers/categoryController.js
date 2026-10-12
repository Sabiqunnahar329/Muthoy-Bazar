import Category from '../models/Category.js';
import Product from '../models/Product.js';
import { asyncHandler, err } from '../utils/helpers.js';

export const list = asyncHandler(async (req, res) => {
  const cats = await Category.find().sort('name').lean();
  const counts = await Product.aggregate([{ $group: { _id: '$category', n: { $sum: 1 } } }]);
  const map = Object.fromEntries(counts.map((c) => [String(c._id), c.n]));
  res.json(cats.map((c) => ({ ...c, count: map[String(c._id)] || 0 })));
});

export const create = asyncHandler(async (req, res) => {
  if (!req.body.name?.trim()) throw err(400, 'Category name is required');
  res.status(201).json(await Category.create({ name: req.body.name.trim(), description: req.body.description || '' }));
});

export const update = asyncHandler(async (req, res) => {
  const c = await Category.findByIdAndUpdate(req.params.id, { name: req.body.name, description: req.body.description }, { new: true, runValidators: true });
  if (!c) throw err(404, 'Category not found');
  res.json(c);
});

export const remove = asyncHandler(async (req, res) => {
  if (await Product.exists({ category: req.params.id })) throw err(400, 'Move or delete the products in this category first');
  await Category.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});
