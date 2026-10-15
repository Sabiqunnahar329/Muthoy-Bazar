import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Phone, Mail, MapPin, X } from 'lucide-react';
import { useLang } from '../context/LanguageContext';
import useMenu from '../lib/useMenu';
import { localizedLabel } from '../lib/helpers.js';

const FACEBOOK = 'https://www.facebook.com/MuthoyBazaar';
const DEVELOPER_FACEBOOK = 'https://www.facebook.com/share/19zN7CPnZq/';
const MAP_URL = 'https://www.google.com/maps/place/%E0%A6%AE%E0%A7%87%E0%A6%B8%E0%A6%BE%E0%A6%B0%E0%A7%8D%E0%A6%B8+%E0%A6%86%E0%A6%AC%E0%A7%8D%E0%A6%A6%E0%A7%81%E0%A6%B2+%E0%A6%B2%E0%A6%A4%E0%A6%BF%E0%A6%AB+%E0%A6%B8%E0%A7%8D%E0%A6%9F%E0%A7%8B%E0%A6%B0/@23.7037076,90.4140163,50m/data=!3m1!1e3!4m6!3m5!1s0x3755b9848728638b:0x268ed1d23b258e63!8m2!3d23.7036629!4d90.4141469!16s%2Fg%2F11xt4b9q_2';
const MAP_SRC = (lang) => `https://maps.google.com/maps?hl=${lang}&q=23.7036629%2C90.4141469&z=18&output=embed`;

// Edit the policy wording with your own terms before launch.
const POLICIES = {
  terms: { title: 'Terms & Conditions', body: ['By placing an order you agree to provide correct name, phone number and delivery address.', 'Prices and stock can change without notice. We may cancel an order if an item is unavailable or the details look fake.', 'Cash on delivery orders must be accepted and paid when the parcel arrives.'] },
  privacy: { title: 'Privacy Policy', body: ['We collect your name, phone number and address only to process and deliver your orders.', 'We do not sell your personal information. Your phone number may be used for order updates by SMS.', 'You can ask us to delete your account data at any time.'] },
  shipping: { title: 'Shipping & Delivery', body: ['Delivery charge is ৳80 inside Dhaka and ৳150 outside Dhaka.', 'Orders are usually delivered within 1 to 3 days inside Dhaka and 3 to 5 days elsewhere.', 'Please keep your phone on so the delivery person can reach you.'] },
  returns: { title: 'Return & Refund', body: ['If you receive a damaged or wrong item, tell us within 24 hours with a photo.', 'We will replace the item or refund the amount after checking.', 'Opened food items cannot be returned unless they are damaged or expired.'] },
};

export default function Footer({ categories = ['Baby Food', 'Beverages', 'Biscuits', 'Breakfast Items', 'Cleaning Supplies', 'Coffee'] }) {
  const { t, lang } = useLang();
  const menu = useMenu();
  const quick = menu?.footer?.length ? menu.footer : null;
  const developerName = lang === 'bn' ? 'সাবিকুন্নাহার' : 'Sabiqunnahar';
  const [policy, setPolicy] = useState(null);

  useEffect(() => {
    if (!policy) return;
    const onKey = (e) => e.key === 'Escape' && setPolicy(null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [policy]);

  const link = 'text-gray-600 transition hover:text-[#8c6747] hover:underline';
  const heading = 'mb-4 text-lg font-bold text-gray-900';
  const icon = 'flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 shadow-sm transition hover:border-[#8c6747] hover:bg-[#8c6747] hover:text-white';
  const card = 'flex gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 shadow-sm';

  return (
    <footer className="mt-12 border-t border-gray-200 bg-white text-gray-600">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Muthoy Bazar" className="h-20 w-20 rounded-xl border border-gray-200 bg-white object-contain p-1" />
            <div>
              <p className="text-xl font-bold text-gray-900">Muthoy Bazar</p>
              <p className="text-sm text-gray-700">{t('tagline')}</p>
            </div>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-gray-600">{t('about')}</p>
          <div className="mt-4 flex gap-3">
            <a href={FACEBOOK} target="_blank" rel="noreferrer" aria-label="Facebook" className={icon}><Facebook size={18} /></a>
            <a href="tel:+8801612633433" aria-label="Call" className={icon}><Phone size={18} /></a>
            <a href="mailto:support@muthoybazar.com" aria-label="Email" className={icon}><Mail size={18} /></a>
          </div>
        </div>

        <div>
          <h3 className={heading}>{t('quickLinks')}</h3>
          <ul className="space-y-2">
            {quick ? quick.map((m) => <li key={m._id}><Link className={link} to={m.url}>{m.label}</Link></li>) : (
              <>
                <li><Link className={link} to="/">{t('home')}</Link></li>
                <li><Link className={link} to="/shop">{t('shop')}</Link></li>
                <li><Link className={link} to="/cart">{t('cart')}</Link></li>
                <li><Link className={link} to="/contact">{t('contact')}</Link></li>
                <li><Link className={link} to="/track">{t('trackOrder')}</Link></li>
              </>
            )}
          </ul>
          <h3 className="mb-3 mt-6 text-lg font-bold text-gray-900">{t('policies')}</h3>
          <ul className="space-y-2">
            {Object.entries(POLICIES).map(([key, p]) => (
              <li key={key}><button onClick={() => setPolicy(key)} className={link}>{t(`${key}Policy`)}</button></li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className={heading}>{t('categories')}</h3>
          <ul className="space-y-2">
            {categories.map((c) => (
              <li key={c}><Link className={link} to={`/shop?category=${encodeURIComponent(c)}`}>{localizedLabel(c, lang)}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className={heading}>{t('contactInfo')}</h3>
          <ul className="space-y-3 text-sm text-gray-700">
            <li className={card}><Phone size={16} className="mt-0.5 shrink-0 text-[#8c6747]" /><span>WhatsApp: <a className="font-medium text-gray-900 hover:text-[#8c6747] hover:underline" href="https://wa.me/8801612633433">+880 1612-633433</a></span></li>
            <li className={card}><Facebook size={16} className="mt-0.5 shrink-0 text-[#8c6747]" /><span>Facebook: <a className="font-medium text-gray-900 hover:text-[#8c6747] hover:underline" href={FACEBOOK} target="_blank" rel="noreferrer">Muthoy Bazar</a></span></li>
            <li className={card}><MapPin size={16} className="mt-0.5 shrink-0 text-[#8c6747]" /><a className="font-medium text-gray-900 hover:text-[#8c6747] hover:underline" href={MAP_URL} target="_blank" rel="noreferrer">{t('storeAddress')} · {t('googleMapsLabel')}</a></li>
          </ul>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-8">
        <iframe
          title="Muthoy Bazar location" src={MAP_SRC(lang)} loading="lazy" allowFullScreen referrerPolicy="no-referrer-when-downgrade"
          className="h-64 w-full rounded-xl border border-gray-200 sm:h-72"
        />
        <a href={MAP_URL} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm font-semibold text-brand hover:underline">{t('openMap')}</a>
      </div>

      <div className="border-t border-gray-200">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-4 text-sm text-gray-600 sm:flex-row">
          <p>© {new Date().getFullYear()} Muthoy Bazar. {t('rights')}</p>
          <p className="flex items-center gap-2">
            <a href={DEVELOPER_FACEBOOK} target="_blank" rel="noopener noreferrer" aria-label={`${developerName} on Facebook`} className="text-gray-600 transition hover:text-[#8c6747]"><Facebook size={16} /></a>
            <span>{t('developedBy')} <span className="font-semibold text-gray-900">{developerName}</span></span>
          </p>
        </div>
      </div>

      {policy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setPolicy(null)}>
          <div role="dialog" aria-modal="true" aria-label={POLICIES[policy].title} onClick={(e) => e.stopPropagation()} className="max-h-[85vh] w-full max-w-lg overflow-auto rounded-2xl bg-white p-6 text-gray-800 shadow-2xl">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">{POLICIES[policy].title}</h2>
              <button onClick={() => setPolicy(null)} aria-label={t('close')} className="rounded p-1 hover:bg-gray-100"><X size={20} /></button>
            </div>
            <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed">
              {POLICIES[policy].body.map((line) => <li key={line}>{line}</li>)}
            </ul>
            <button onClick={() => setPolicy(null)} className="mt-5 w-full rounded-lg bg-cta py-2.5 font-semibold text-white hover:bg-cta-dark">{t('close')}</button>
          </div>
        </div>
      )}
    </footer>
  );
}
