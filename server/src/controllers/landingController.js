import LandingPage from '../models/LandingPage.js';
import { asyncHandler, err } from '../utils/helpers.js';

const slugify = (s) => String(s || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const safeUrl = (u) => !u || /^(https?:\/\/|\/|#)/i.test(u);

const clean = (b) => {
  const d = {
    title: String(b.title || '').trim(),
    slug: slugify(b.slug || b.title),
    headline: String(b.headline || '').trim(),
    subheadline: String(b.subheadline || '').trim(),
    bannerUrl: String(b.bannerUrl || '').trim(),
    ctaText: String(b.ctaText || 'Order now').trim(),
    ctaLink: String(b.ctaLink || '#products').trim(),
    sections: (Array.isArray(b.sections) ? b.sections : []).map((s) => ({ heading: String(s.heading || '').trim(), body: String(s.body || '').trim() })).filter((s) => s.heading || s.body),
    products: Array.isArray(b.products) ? b.products : [],
    published: !!b.published,
  };
  if (!d.title) throw err(400, 'Enter a page title');
  if (!d.slug) throw err(400, 'Enter a page address (slug)');
  if (!safeUrl(d.bannerUrl)) throw err(400, 'Banner URL must start with http://, https:// or /');
  if (!safeUrl(d.ctaLink)) throw err(400, 'Button link must start with http://, https://, / or #');
  return d;
};

export const list = asyncHandler(async (req, res) => res.json(await LandingPage.find().sort('-updatedAt').populate('products', 'name')));
export const create = asyncHandler(async (req, res) => res.status(201).json(await LandingPage.create(clean(req.body))));
export const update = asyncHandler(async (req, res) => {
  const p = await LandingPage.findByIdAndUpdate(req.params.id, clean(req.body), { new: true, runValidators: true });
  if (!p) throw err(404, 'Landing page not found');
  res.json(p);
});
export const remove = asyncHandler(async (req, res) => { await LandingPage.findByIdAndDelete(req.params.id); res.json({ message: 'Deleted' }); });

// Public: only published pages
export const bySlug = asyncHandler(async (req, res) => {
  const p = await LandingPage.findOne({ slug: req.params.slug.toLowerCase(), published: true })
    .populate({ path: 'products', populate: { path: 'category', select: 'name' } });
  if (!p) throw err(404, 'This page is not available');
  res.json(p);
});
