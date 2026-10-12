import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api.js';
import { apiError } from '../lib/helpers.js';
import { Card, field, btnPrimary } from './ui.jsx';

export default function AdminWebsite() {
  const [form, setForm] = useState(null);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get('/settings')
      .then(({ data }) => setForm(data))
      .catch((e) => setError(apiError(e, 'Could not load website settings.')));
  }, []);

  const set = (key) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setForm((current) => ({ ...current, [key]: value }));
    setSaved('');
  };

  const save = async (event) => {
    event.preventDefault();
    setError('');
    setSaved('');
    setBusy(true);
    try {
      const { data } = await api.put('/settings/website', form);
      setForm(data);
      setSaved('Website content saved.');
    } catch (e) {
      setError(apiError(e));
    } finally {
      setBusy(false);
    }
  };

  if (!form) return error ? <p role="alert" className="text-red-600">{error}</p> : <p className="text-gray-500">Loading…</p>;

  return (
    <form onSubmit={save} className="max-w-3xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">Website</h1>
        <Link to="/" target="_blank" rel="noreferrer" className="rounded-lg border bg-white px-3 py-2 text-sm font-medium hover:bg-gray-50">Preview storefront</Link>
      </div>
      <Card className="space-y-4">
        <label className="flex items-center gap-2 text-sm font-semibold">
          <input type="checkbox" checked={form.announcementEnabled} onChange={set('announcementEnabled')} />
          Show announcement on the homepage
        </label>
        <label className="block text-sm font-medium">Announcement (180 characters max)
          <input value={form.announcement} onChange={set('announcement')} maxLength={180} className={`${field} mt-1`} />
        </label>
        <label className="block text-sm font-medium">Homepage banner title
          <input value={form.heroTitle} onChange={set('heroTitle')} maxLength={120} required className={`${field} mt-1`} />
        </label>
        <label className="block text-sm font-medium">Banner description
          <textarea value={form.heroText} onChange={set('heroText')} maxLength={300} rows={3} className={`${field} mt-1`} />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium">Button label
            <input value={form.heroCta} onChange={set('heroCta')} maxLength={40} required className={`${field} mt-1`} />
          </label>
          <label className="block text-sm font-medium">Button link (site path)
            <input value={form.heroLink} onChange={set('heroLink')} placeholder="/shop" required className={`${field} mt-1`} />
          </label>
        </div>
        <label className="block text-sm font-medium">Banner image path or HTTPS URL
          <input value={form.heroImage} onChange={set('heroImage')} placeholder="/banners/slide-1.jpg" className={`${field} mt-1`} />
        </label>
      </Card>
      <p className="text-xs text-gray-500">The button link must stay on this website. Put uploaded banners in the server’s public uploads folder and use its /uploads/... path.</p>
      {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      {saved && <p role="status" className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800">{saved}</p>}
      <button disabled={busy} className={btnPrimary}>{busy ? 'Saving…' : 'Save website content'}</button>
    </form>
  );
}
