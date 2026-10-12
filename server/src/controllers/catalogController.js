import Product from '../models/Product.js';
import Setting from '../models/Setting.js';
import { asyncHandler } from '../utils/helpers.js';

const getBaseUrl = () => (process.env.CLIENT_URL || `http://localhost:${process.env.PORT || 5000}`).replace(/\/+$/, '');
const hasImage = (product) => Array.isArray(product.images) && product.images.some((image) => typeof image === 'string' && image.trim());
const csvCell = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
const absoluteUrl = (base, value) => {
  try {
    const url = new URL(value, `${base}/`);
    return ['http:', 'https:'].includes(url.protocol) ? url.toString() : '';
  } catch {
    return '';
  }
};

const getCatalogProducts = () => Product.find().select('name description brand images price discountPrice stock sku');

export const catalogStatus = asyncHandler(async (req, res) => {
  const [products, setting] = await Promise.all([
    getCatalogProducts(),
    Setting.findOne({ key: 'main' }).select('storeName currency'),
  ]);
  const includedProducts = products.filter((product) => (
    hasImage(product) && absoluteUrl(getBaseUrl(), product.images.find((image) => typeof image === 'string' && image.trim()))
  )).length;
  res.json({
    feedUrl: `${req.protocol}://${req.get('host')}/api/catalog/meta.csv`,
    storeName: setting?.storeName || 'Muthoy Bazar',
    totalProducts: products.length,
    includedProducts,
    missingImageProducts: products.filter((product) => !hasImage(product)).length,
    excludedProducts: products.length - includedProducts,
    baseUrlConfigured: Boolean(process.env.CLIENT_URL),
  });
});

export const metaFeed = asyncHandler(async (req, res) => {
  const [products, setting] = await Promise.all([getCatalogProducts(), Setting.findOne({ key: 'main' }).select('storeName')]);
  const base = getBaseUrl();
  const rows = [
    ['id', 'title', 'description', 'availability', 'condition', 'price', 'link', 'image_link', 'brand'],
  ];

  for (const product of products) {
    if (!hasImage(product)) continue;
    const imageLink = absoluteUrl(base, product.images.find((image) => typeof image === 'string' && image.trim()));
    if (!imageLink) continue;
    rows.push([
      product.sku || product._id,
      product.name,
      product.description,
      product.stock > 0 ? 'in stock' : 'out of stock',
      'new',
      `${Number(product.discountPrice > 0 ? product.discountPrice : product.price).toFixed(2)} BDT`,
      absoluteUrl(base, `/product/${product._id}`),
      imageLink,
      product.brand || setting?.storeName || 'Muthoy Bazar',
    ]);
  }

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="muthoy-bazar-meta-catalog.csv"');
  res.send(`\uFEFF${rows.map((row) => row.map(csvCell).join(',')).join('\r\n')}`);
});
