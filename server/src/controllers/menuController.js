import MenuItem from '../models/MenuItem.js';
import { asyncHandler, err } from '../utils/helpers.js';

const DEFAULTS = {
  header: [['Offer Zone', '/shop?flag=offer'], ['Honey', '/shop?category=Honey'], ['Cooking Oil', '/shop?category=Cooking%20Oil'], ['Dates', '/shop?category=Dates'], ['Spices', '/shop?category=Spices'], ['Rice', '/shop?category=Rice'], ['Lentils', '/shop?category=Lentils'], ['Pickle', '/shop?category=Pickles']],
  footer: [['Home', '/'], ['Shop', '/shop'], ['Track order', '/track'], ['Contact', '/contact']],
};

const clean = (b) => {
  const d = { location: b.location, label: String(b.label || '').trim(), url: String(b.url || '').trim(), visible: b.visible !== false };
  if (!['header', 'footer'].includes(d.location)) throw err(400, 'Choose header or footer');
  if (!d.label) throw err(400, 'Enter a label');
  if (!/^(https?:\/\/|\/)/i.test(d.url)) throw err(400, 'Link must start with / or http(s)://');
  return d;
};

// Public: visible items only
export const publicMenus = asyncHandler(async (req, res) => {
  const items = await MenuItem.find({ visible: true }).sort('order createdAt');
  res.json({ header: items.filter((i) => i.location === 'header'), footer: items.filter((i) => i.location === 'footer') });
});

export const all = asyncHandler(async (req, res) => res.json(await MenuItem.find().sort('order createdAt')));

export const create = asyncHandler(async (req, res) => {
  const d = clean(req.body);
  const last = await MenuItem.findOne({ location: d.location }).sort('-order');
  res.status(201).json(await MenuItem.create({ ...d, order: (last?.order ?? -1) + 1 }));
});

export const update = asyncHandler(async (req, res) => {
  const m = await MenuItem.findById(req.params.id);
  if (!m) throw err(404, 'Menu item not found');
  m.set(clean({ ...m.toObject(), ...req.body }));
  await m.save();
  res.json(m);
});

export const remove = asyncHandler(async (req, res) => { await MenuItem.findByIdAndDelete(req.params.id); res.json({ message: 'Deleted' }); });

// Body: { location, ids: [id, id, ...] } in the new order
export const reorder = asyncHandler(async (req, res) => {
  const { location, ids } = req.body;
  if (!Array.isArray(ids)) throw err(400, 'ids must be a list');
  await Promise.all(ids.map((id, i) => MenuItem.updateOne({ _id: id, location }, { order: i })));
  res.json({ message: 'Saved' });
});

export const defaults = asyncHandler(async (req, res) => {
  const { location } = req.body;
  if (!DEFAULTS[location]) throw err(400, 'Choose header or footer');
  if (await MenuItem.exists({ location })) throw err(400, 'This menu already has items');
  await MenuItem.insertMany(DEFAULTS[location].map(([label, url], order) => ({ location, label, url, order })));
  res.json({ message: 'Added' });
});
