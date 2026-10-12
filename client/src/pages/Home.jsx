import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react';
import api from '../lib/api.js';
import ProductCard from '../components/ProductCard.jsx';
import { useCart } from '../context/CartContext.jsx';
import { emoji, money, localizedLabel } from '../lib/helpers.js';
import { useLang } from '../context/LanguageContext.jsx';

function Section({ title, to, products, viewAll }) {
  const safeProducts = Array.isArray(products) ? products : [];
  if (!safeProducts.length) return null;
  return (
    <section className="mt-10">
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="text-2xl font-bold">{title}</h2>
        {to && <Link to={to} className="font-semibold text-brand hover:underline">{viewAll}</Link>}
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {safeProducts.map((p) => <ProductCard key={p._id} p={p} />)}
      </div>
    </section>
  );
}

// A failed or unexpected response (for example a web page instead of JSON) is marked `failed`,
// so the page can show a message instead of looking empty.
const get = (params) => api.get('/products', { params })
  .then((r) => (Array.isArray(r.data?.products) ? r.data : { products: [], pages: 1, failed: true }))
  .catch(() => ({ products: [], pages: 1, failed: true }));

const SLIDES = [
  { title: 'সাধ্যের মধ্যে স্বস্তির বাজার', text: 'Rice, oil, spices and daily needs from trusted brands. Cash on delivery across Bangladesh.', cta: 'Shop the offer zone', to: '/shop?flag=offer', bg: 'from-brand-dark to-emerald-700', img: '/banners/slide-1.jpg' },
  { title: 'New arrivals every week', text: 'See what just landed on our shelves.', cta: 'Shop new arrivals', to: '/shop?flag=new', bg: 'from-teal-900 to-teal-600', img: '/banners/slide-2.jpg' },
  { title: 'Pure honey and premium dates', text: 'Natural sweetness from trusted sources, packed fresh.', cta: 'Shop honey', to: '/shop?category=Honey', bg: 'from-amber-800 to-amber-500', img: '/banners/slide-3.jpg' },
];

const FEATURED = ['Rice', 'Cooking Oil', 'Ghee', 'Spices', 'Tea', 'Coffee', 'Honey', 'Dates', 'Dry Fruits', 'Noodles'];

function HeroSlider({ settings, t }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const slides = [
    { ...SLIDES[0], title: settings?.heroTitle || t('tagline'), text: settings?.heroText || t('slide1Text'), cta: settings?.heroCta || t('slide1Cta'), to: settings?.heroLink || SLIDES[0].to, img: settings?.heroImage || SLIDES[0].img },
    { ...SLIDES[1], title: t('slide2Title'), text: t('slide2Text'), cta: t('slide2Cta') },
    { ...SLIDES[2], title: t('slide3Title'), text: t('slide3Text'), cta: t('slide3Cta') },
  ];
  const go = (n) => setI((n + slides.length) % slides.length);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setI((x) => (x + 1) % slides.length), 5000);
    return () => clearInterval(id);
  }, [paused, slides.length]);

  const arrow = 'absolute top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/80 p-2 text-brand shadow hover:bg-white';

  return (
    <div
      className="relative min-h-60 overflow-hidden rounded-2xl sm:min-h-72 lg:min-h-80"
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
      role="region" aria-roledescription="carousel" aria-label={t('promotions')}
    >
      {slides.map((s, n) => (
        <div key={s.title} aria-hidden={n !== i} className={`absolute inset-0 bg-gradient-to-br ${s.bg} transition-opacity duration-700 ${n === i ? 'opacity-100' : 'pointer-events-none opacity-0'}`}>
          <img src={s.img} alt="" onError={(e) => (e.currentTarget.style.display = 'none')} className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-transparent" />
          <div className="relative flex h-full max-w-lg flex-col justify-center gap-3 px-12 py-8 text-white sm:px-16">
            <h1 className="text-3xl font-bold leading-tight sm:text-4xl">{s.title}</h1>
            <p className="text-white/90">{s.text}</p>
            <Link to={s.to} tabIndex={n === i ? 0 : -1} className="w-fit rounded-lg bg-cta px-6 py-2.5 font-semibold text-white hover:bg-cta-dark">{s.cta}</Link>
          </div>
        </div>
      ))}
      <button onClick={() => go(i - 1)} aria-label={t('previousSlide')} className={`${arrow} left-3`}><ChevronLeft size={20} /></button>
      <button onClick={() => go(i + 1)} aria-label={t('nextSlide')} className={`${arrow} right-3`}><ChevronRight size={20} /></button>
      <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-2">
        {slides.map((s, n) => (
          <button key={s.title} onClick={() => setI(n)} aria-label={`Go to slide ${n + 1}`} aria-current={n === i} className={`h-2.5 rounded-full transition-all ${n === i ? 'w-6 bg-white' : 'w-2.5 bg-white/60'}`} />
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const [d, setD] = useState({ best: [], offer: [], fresh: [], cats: [], brands: [] });
  const [siteSettings, setSiteSettings] = useState(null);
  const [more, setMore] = useState({ list: [], page: 1, pages: 1, loading: false });
  const [status, setStatus] = useState('loading'); // loading, ok, empty or error
  const { count, subtotal, setOpen } = useCart();
  const { lang, t } = useLang();
  const rail = useRef(null);

  const load = () => {
    setStatus('loading');
    Promise.all([
      get({ flag: 'best', limit: 10 }), get({ flag: 'offer', limit: 10 }), get({ flag: 'new', limit: 10 }), get({ limit: 10 }),
      api.get('/categories').then((r) => r.data).catch(() => []),
      api.get('/products/brands').then((r) => r.data).catch(() => []),
    ]).then(([best, offer, fresh, all, cats, brands]) => {
      setD({
        best: best.products, offer: offer.products, fresh: fresh.products,
        cats: Array.isArray(cats) ? cats : [],
        brands: Array.isArray(brands) ? brands : [],
      });
      setMore({ list: all.products, page: 1, pages: all.pages || 1, loading: false });
      if ([best, offer, fresh, all].every((r) => r.failed)) setStatus('error');
      else setStatus(all.products.length ? 'ok' : 'empty');
    });
  };

  useEffect(() => {
    load();
    api.get('/settings').then(({ data }) => setSiteSettings(data)).catch((error) => {
      console.warn('Website settings could not be loaded:', error.response?.data?.message || error.message);
      setSiteSettings({});
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadMore = async () => {
    setMore((m) => ({ ...m, loading: true }));
    const r = await get({ limit: 10, page: more.page + 1 });
    const newProducts = Array.isArray(r?.products) ? r.products : [];
    setMore((m) => ({ list: [...m.list, ...newProducts], page: m.page + 1, pages: r?.pages || m.pages, loading: false }));
  };

  const scrollRail = (dir) => rail.current?.scrollBy({ left: dir * 320, behavior: 'smooth' });

  // Safe brand array fallback
  const safeBrands = Array.isArray(d?.brands) ? d.brands : [];

  return (
    <main className="mx-auto max-w-7xl px-4 pb-6">
      {/* Floating cart widget on the right edge */}
      <button
        onClick={() => setOpen(true)}
        aria-label={`${t('cart')}: ${count} ${t('items')}, ${money(subtotal)}`}
        className="fixed right-0 top-1/2 z-30 -translate-y-1/2 overflow-hidden rounded-l-xl bg-cta text-center text-white shadow-lg transition hover:bg-cta-dark"
      >
        <span className="flex flex-col items-center gap-1 px-3 pb-2 pt-2.5">
          <ShoppingBag size={22} />
          <span className="text-xs font-bold">{lang === 'bn' ? count.toLocaleString('bn-BD') : count} {t('items')}</span>
        </span>
        <span className="block bg-black/20 px-3 py-1.5 text-xs font-bold">{money(subtotal)}</span>
      </button>

      {/* Hero: slider on the left, promo card on the right */}
      {siteSettings?.announcementEnabled && siteSettings.announcement && (
        <p role="status" className="mt-4 rounded-lg bg-brand px-4 py-2 text-center text-sm font-semibold text-white">{siteSettings.announcement}</p>
      )}
      <div className="mt-5 grid gap-4 lg:grid-cols-[2fr_1fr]">
        <HeroSlider settings={siteSettings} t={t} />
        <Link to="/shop?flag=offer" className="relative flex min-h-48 flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br from-amber-100 to-orange-300 p-6 text-brand-dark transition hover:shadow-lg lg:min-h-80">
          <img src="/banners/promo.jpg" alt="" onError={(e) => (e.currentTarget.style.display = 'none')} className="absolute inset-0 h-full w-full object-cover" />
          <span className="relative w-fit rounded-full bg-cta px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">{t('offerZone')}</span>
          <span aria-hidden="true" className="relative self-end text-7xl drop-shadow sm:text-8xl">🛒</span>
          <span className="relative">
            <b className="block text-2xl font-bold leading-tight">{t('promoTitle')}</b>
            <span className="mt-1 block text-sm">{t('promoText')}</span>
            <span className="mt-3 inline-block rounded-lg bg-brand px-5 py-2 text-sm font-semibold text-white">{t('shopOffers')}</span>
          </span>
        </Link>
      </div>

      {/* Featured categories: horizontally scrollable circles */}
      <section className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">{t('featuredCategories')}</h2>
          <div className="flex gap-2">
            <button onClick={() => scrollRail(-1)} aria-label={t('scrollCategoriesLeft')} className="rounded-full border bg-white p-2 text-brand hover:bg-brand-light"><ChevronLeft size={18} /></button>
            <button onClick={() => scrollRail(1)} aria-label={t('scrollCategoriesRight')} className="rounded-full border bg-white p-2 text-brand hover:bg-brand-light"><ChevronRight size={18} /></button>
          </div>
        </div>
        <div ref={rail} className="flex snap-x gap-5 overflow-x-auto pb-3" style={{ scrollbarWidth: 'none' }}>
          {FEATURED.map((n) => (
            <Link key={n} to={`/shop?category=${encodeURIComponent(n)}`} className="group w-28 shrink-0 snap-start text-center sm:w-32">
              <span className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border-2 border-brand/10 bg-gradient-to-br from-brand-light to-white text-5xl shadow-sm transition group-hover:scale-105 group-hover:border-brand sm:h-28 sm:w-28 sm:text-6xl">{emoji(n)}</span>
              <span className="mt-2 block text-sm font-semibold group-hover:text-brand">{localizedLabel(n, lang)}</span>
            </Link>
          ))}
        </div>
      </section>

      {status === 'loading' && <p className="mt-10 text-center text-gray-500" role="status">{t('loadingProducts')}</p>}
      {status === 'error' && (
        <div role="alert" className="mt-10 rounded-xl border border-red-200 bg-red-50 p-5 text-center">
          <p className="font-semibold text-red-800">{t('loadProductsError')}</p>
          <p className="mt-1 text-sm text-red-700">{t('serverStarting')}</p>
          <button onClick={load} className="mt-3 rounded-lg bg-cta px-5 py-2 font-semibold text-white hover:bg-cta-dark">{t('tryAgain')}</button>
        </div>
      )}
      {status === 'empty' && (
        <p className="mt-10 rounded-xl border bg-white p-5 text-center text-gray-600">
          {t('noProducts')}
          {process.env.NODE_ENV !== 'production' && ' (Development note: the database returned no products. Run "npm run seed" in the server folder and check that MONGO_URI uses the database that was seeded.)'}
        </p>
      )}

      <Section title={t('topSelling')} to="/shop?flag=best" products={d.best} viewAll={t('viewAllItems')} />

      {safeBrands.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 text-2xl font-bold">{t('ourBrands')}</h2>
          <div className="flex flex-wrap gap-2">
            {safeBrands.slice(0, 12).map((b) => (
              <Link key={b} to={`/shop?brand=${encodeURIComponent(b)}`} className="rounded-lg border bg-white px-4 py-2 font-semibold hover:border-brand hover:text-brand">
                {b}
              </Link>
            ))}
          </div>
        </section>
      )}

      <Section title={t('offerZone')} to="/shop?flag=offer" products={d.offer} viewAll={t('viewAllItems')} />
      <Section title={t('newArrivals')} to="/shop?flag=new" products={d.fresh} viewAll={t('viewAllItems')} />
      <Section title={t('justForYou')} to="/shop" products={more.list} viewAll={t('viewAllItems')} />
      {more.page < more.pages && (
        <div className="mt-6 text-center">
          <button onClick={loadMore} disabled={more.loading} className="rounded-lg border-2 border-brand px-8 py-2 font-semibold text-brand hover:bg-brand-light disabled:opacity-60">
            {more.loading ? t('loadingProducts') : t('loadMore')}
          </button>
        </div>
      )}

      <section className="mt-12">
        <h2 className="mb-4 text-2xl font-bold">{t('customersSay')}</h2>
        <div className="grid gap-4 md:grid-cols-3">
          [[t('review1'), 'Rahim U.', t('serviceHolder')], [t('review2'), 'Nusrat J.', t('teacher')], [t('review3'), 'Sabbir A.', t('businessOwner')]].map(([q, n, r]) => (
            <figure key={n} className="rounded-xl border bg-white p-5"><blockquote className="mb-3">{q}</blockquote><figcaption className="text-sm"><b>{n}</b> <span className="text-gray-500">{r}</span></figcaption></figure>
          ))}
        </div>
      </section>
    </main>
  );
}