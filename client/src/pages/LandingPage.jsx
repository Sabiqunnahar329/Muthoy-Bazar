import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../lib/api.js';
import ProductCard from '../components/ProductCard.jsx';

const Cta = ({ href, children }) => {
  const cls = 'inline-block rounded-lg bg-cta px-8 py-3 text-lg font-bold text-white shadow-lg hover:bg-cta-dark';
  if (href.startsWith('/')) return <Link to={href} className={cls}>{children}</Link>;
  return <a href={href} className={cls} {...(href.startsWith('http') ? { target: '_blank', rel: 'noreferrer' } : {})}>{children}</a>;
};

export default function LandingPage() {
  const { slug } = useParams();
  const [p, setP] = useState(null);
  const [missing, setMissing] = useState(false);
  useEffect(() => { setP(null); setMissing(false); api.get(`/landing/page/${slug}`).then((r) => { setP(r.data); document.title = `${r.data.title} | Muthoy Bazar`; }).catch(() => setMissing(true)); }, [slug]);

  if (missing) return <p className="py-20 text-center">This page is not available. <Link to="/shop" className="text-brand underline">Go to the shop</Link></p>;
  if (!p) return <p className="py-20 text-center text-gray-500">Loading…</p>;

  return (
    <main>
      <section className="relative flex min-h-80 items-center bg-gradient-to-br from-brand-dark to-emerald-700 text-white">
        {p.bannerUrl && <img src={p.bannerUrl} alt="" onError={(e) => (e.currentTarget.style.display = 'none')} className="absolute inset-0 h-full w-full object-cover" />}
        <div className="absolute inset-0 bg-black/45" />
        <div className="relative mx-auto w-full max-w-5xl px-4 py-14 text-center">
          <h1 className="text-3xl font-bold leading-tight sm:text-5xl">{p.headline || p.title}</h1>
          {p.subheadline && <p className="mx-auto mt-3 max-w-2xl text-lg text-white/90">{p.subheadline}</p>}
          <div className="mt-6"><Cta href={p.ctaLink || '#products'}>{p.ctaText || 'Order now'}</Cta></div>
        </div>
      </section>

      {p.sections.length > 0 && (
        <section className="mx-auto grid max-w-5xl gap-6 px-4 py-12 md:grid-cols-2">
          {p.sections.map((s, i) => <div key={i} className="rounded-2xl border bg-white p-6">{s.heading && <h2 className="mb-2 text-xl font-bold text-brand">{s.heading}</h2>}<p className="whitespace-pre-line text-gray-700">{s.body}</p></div>)}
        </section>
      )}

      {p.products.length > 0 && (
        <section id="products" className="mx-auto max-w-6xl px-4 pb-14">
          <h2 className="mb-5 text-center text-2xl font-bold">Order now</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{p.products.map((x) => <ProductCard key={x._id} p={x} />)}</div>
        </section>
      )}
    </main>
  );
}
