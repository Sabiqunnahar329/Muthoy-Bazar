import Setting from '../models/Setting.js';
import { asyncHandler, err } from '../utils/helpers.js';

const get = () => Setting.findOneAndUpdate({ key: 'main' }, {}, { upsert: true, new: true, setDefaultsOnInsert: true });

export const read = asyncHandler(async (req, res) => {
  const setting = await get();
  res.json({
    announcementEnabled: false,
    announcement: '',
    heroTitle: 'সাধ্যের মধ্যে স্বস্তির বাজার',
    heroText: 'Rice, oil, spices and daily needs from trusted brands. Cash on delivery across Bangladesh.',
    heroCta: 'Shop the offer zone',
    heroLink: '/shop?flag=offer',
    heroImage: '/banners/slide-1.jpg',
    ...setting.toObject(),
  });
});

export const update = asyncHandler(async (req, res) => {
  const b = req.body;
  const d = {
    storeName: String(b.storeName || '').trim(), currency: String(b.currency || '').trim(), taxRate: Number(b.taxRate),
    phone: String(b.phone || '').trim(), whatsapp: String(b.whatsapp || '').trim(), email: String(b.email || '').trim(), address: String(b.address || '').trim(),
  };
  if (!d.storeName) throw err(400, 'Enter the store name');
  if (!d.currency || d.currency.length > 5) throw err(400, 'Currency symbol must be 1 to 5 characters');
  if (!(d.taxRate >= 0 && d.taxRate <= 100)) throw err(400, 'Tax rate must be between 0 and 100');
  if (d.email && !/^\S+@\S+\.\S+$/.test(d.email)) throw err(400, 'Enter a valid email address');
  res.json(await Setting.findOneAndUpdate({ key: 'main' }, d, { upsert: true, new: true, runValidators: true }));
});

export const updateWebsite = asyncHandler(async (req, res) => {
  const b = req.body;
  const d = {
    announcementEnabled: b.announcementEnabled === true,
    announcement: String(b.announcement || '').trim(),
    heroTitle: String(b.heroTitle || '').trim(),
    heroText: String(b.heroText || '').trim(),
    heroCta: String(b.heroCta || '').trim(),
    heroLink: String(b.heroLink || '').trim(),
    heroImage: String(b.heroImage || '').trim(),
  };

  if (d.announcement.length > 180) throw err(400, 'Announcement must be 180 characters or fewer');
  if (!d.heroTitle || d.heroTitle.length > 120) throw err(400, 'Enter a hero title up to 120 characters');
  if (d.heroText.length > 300) throw err(400, 'Hero text must be 300 characters or fewer');
  if (!d.heroCta || d.heroCta.length > 40) throw err(400, 'Enter a button label up to 40 characters');
  if (!d.heroLink.startsWith('/') || d.heroLink.startsWith('//')) throw err(400, 'The hero button link must be a path on this website');
  if (d.heroImage && !d.heroImage.startsWith('/') && !/^https:\/\//i.test(d.heroImage)) {
    throw err(400, 'Hero image must be a website path or an HTTPS URL');
  }

  res.json(await Setting.findOneAndUpdate({ key: 'main' }, d, { upsert: true, new: true, runValidators: true }));
});
