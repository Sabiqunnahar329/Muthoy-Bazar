import fs from 'fs';
import path from 'path';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import { asyncHandler, err, escapeRegex } from '../utils/helpers.js';
import { uploadDir } from '../middleware/upload.js';
import { fileURLToPath } from 'url';

const publicProductsDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../client/public/products');

const SORTS = { price_asc: { effectivePrice: 1 }, price_desc: { effectivePrice: -1 }, stock: { stock: 1 }, newest: { _id: -1 } };

export const list = asyncHandler(async (req, res) => {
  const { category, brand, search, flag, sort, page = 1, limit = 20 } = req.query;
  const q = {};
  if (category) {
    const c = await Category.findOne({ name: category });
    q.category = c ? c._id : null;
  }
  if (brand) q.brand = brand;
  if (search) {
    const rx = new RegExp(escapeRegex(search), 'i');
    q.$or = [{ name: rx }, { brand: rx }];
  }
  if (flag === 'best') q.isBestSeller = true;
  if (flag === 'new') q.isNewArrival = true;
  if (flag === 'featured') q.isFeatured = true;
  if (flag === 'offer') q.discountPrice = { $gt: 0 };
  const lim = Math.min(parseInt(limit) || 20, 100);
  const pg = Math.max(parseInt(page) || 1, 1);
  const [products, total] = await Promise.all([
    Product.find(q).populate('category', 'name').sort(SORTS[sort] || { _id: 1 }).skip((pg - 1) * lim).limit(lim),
    Product.countDocuments(q),
  ]);
  res.json({ products, total, page: pg, pages: Math.ceil(total / lim) });
});

export const brands = asyncHandler(async (req, res) => {
  const counts = await Product.aggregate([{ $group: { _id: '$brand', n: { $sum: 1 } } }, { $sort: { n: -1 } }]);
  res.json(counts.filter((b) => b._id).map((b) => b._id));
});

export const getOne = asyncHandler(async (req, res) => {
  const p = await Product.findById(req.params.id).populate('category', 'name');
  if (!p) throw err(404, 'Product not found');
  res.json(p);
});

const parse = (b) => ({
  name: b.name?.trim(),
  brand: b.brand?.trim() || '',
  category: b.category,
  description: b.description || '',
  price: Number(b.price),
  discountPrice: Number(b.discountPrice) || 0,
  stock: Math.max(0, Number(b.stock) || 0),
  weight: b.weight === '' || b.weight == null ? undefined : Number(b.weight),
  unit: b.unit || 'pcs',
  isFeatured: b.isFeatured === 'true',
  isBestSeller: b.isBestSeller === 'true',
  isNewArrival: b.isNewArrival === 'true',
});

const check = async (d) => {
  if (!d.name) throw err(400, 'Product name is required');
  if (!(d.price > 0)) throw err(400, 'Price must be above 0');
  if (d.discountPrice && d.discountPrice >= d.price) throw err(400, 'Discount price must be lower than the price');
  if (!(await Category.exists({ _id: d.category }))) throw err(400, 'Choose a valid category');
};

const removeFiles = (urls) =>
  urls.filter((u) => u.startsWith('/uploads/')).forEach((u) => fs.unlink(path.join(uploadDir, path.basename(u)), () => {}));

const imageIssue = (image) => {
  if (typeof image !== 'string' || !image.trim()) return 'Empty image path';
  if (image.startsWith('/uploads/')) return fs.existsSync(path.join(uploadDir, path.basename(image))) ? '' : 'Uploaded image file is missing';
  if (image.startsWith('/products/')) return fs.existsSync(path.join(publicProductsDir, path.basename(image))) ? '' : 'Product image file is missing';
  try {
    return new URL(image).protocol === 'https:' ? '' : 'Image URL must use HTTPS';
  } catch {
    return 'Unsupported image path';
  }
};

export const imageAudit = asyncHandler(async (req, res) => {
  const products = await Product.find().select('name sku images').sort('name');
  const findings = products.flatMap((product) => {
    const images = Array.isArray(product.images) ? product.images : [];
    if (!images.length) return [{ _id: product._id, name: product.name, sku: product.sku, issue: 'No product image', imageCount: 0 }];
    const issues = images.map(imageIssue).filter(Boolean);
    return issues.length
      ? [{ _id: product._id, name: product.name, sku: product.sku, issue: [...new Set(issues)].join('; '), imageCount: images.length }]
      : [];
  });
  res.json({ totalProducts: products.length, checkedProducts: products.length, passedProducts: products.length - findings.length, findings });
});

export const create = asyncHandler(async (req, res) => {
  const d = parse(req.body);
  await check(d);
  const images = (req.files || []).map((f) => `/uploads/${f.filename}`);
  const p = await Product.create({ ...d, images, sku: `MB-${Date.now().toString(36).toUpperCase()}` });
  res.status(201).json(p);
});

export const update = asyncHandler(async (req, res) => {
  const p = await Product.findById(req.params.id);
  if (!p) throw err(404, 'Product not found');
  const d = parse(req.body);
  await check(d);
  const keep = req.body.existingImages ? JSON.parse(req.body.existingImages) : p.images;
  removeFiles(p.images.filter((u) => !keep.includes(u)));
  p.set(d);
  p.images = [...keep, ...(req.files || []).map((f) => `/uploads/${f.filename}`)];
  await p.save();
  res.json(p);
});

export const setStock = asyncHandler(async (req, res) => {
  const stock = Number(req.body.stock);
  if (!Number.isFinite(stock) || stock < 0) throw err(400, 'Stock must be 0 or more');
  const p = await Product.findByIdAndUpdate(req.params.id, { stock }, { new: true });
  if (!p) throw err(404, 'Product not found');
  res.json(p);
});

export const remove = asyncHandler(async (req, res) => {
  const p = await Product.findById(req.params.id);
  if (!p) throw err(404, 'Product not found');
  removeFiles(p.images);
  await p.deleteOne();
  res.json({ message: 'Deleted' });
});
