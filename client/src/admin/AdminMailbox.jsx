import { useEffect, useState } from 'react';
import { Trash2, Send } from 'lucide-react';
import api from '../lib/api.js';
import { apiError, fmtDate } from '../lib/helpers.js';
import { Card, field, btnPrimary } from './ui.jsx';

const BADGE = { unread: 'bg-cta text-white', read: 'bg-gray-100 text-gray-700', replied: 'bg-green-100 text-green-800' };

// source = 'contact' shows only contact form queries; empty shows every customer message
export default function AdminMailbox({ source = '', title = 'Support Mailbox' }) {
  const [list, setList] = useState(null);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [sel, setSel] = useState(null);
  const [reply, setReply] = useState('');
  const [msg, setMsg] = useState('');

  const load = () => api.get('/support', { params: { source, status, search } }).then((r) => setList(r.data)).catch(() => setList([]));
  useEffect(() => { const id = setTimeout(load, 250); return () => clearTimeout(id); }, [source, status, search]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { setSel(null); }, [source]);

  const open = async (m) => { setSel(m); setReply(''); setMsg(''); if (m.status === 'unread') { const { data } = await api.patch(`/support/${m._id}/read`).catch(() => ({ data: m })); setSel(data); load(); } };
  const send = async (e) => {
    e.preventDefault(); setMsg('');
    try { const { data } = await api.post(`/support/${sel._id}/reply`, { reply }); setSel(data); setReply(''); setMsg(data.phone ? 'Reply saved and sent by SMS.' : 'Reply saved. This customer left an email only, so send it from your email app.'); load(); }
    catch (er) { setMsg(apiError(er)); }
  };
  const remove = async () => { await api.delete(`/support/${sel._id}`).catch(() => {}); setSel(null); load(); };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{title}</h1>
      <div className="flex flex-wrap gap-2">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search messages" aria-label="Search messages" className={`${field} max-w-xs`} />
        <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status" className={`${field} w-auto`}><option value="">All</option><option value="unread">Unread</option><option value="read">Read</option><option value="replied">Replied</option></select>
      </div>
      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="p-0 lg:col-span-2">
          {list === null ? <p className="p-5 text-gray-500">Loading…</p> : list.length === 0 ? <p className="p-5 text-gray-500">No messages yet. Messages from the website contact form appear here.</p> : (
            <ul className="max-h-[70vh] overflow-y-auto">{list.map((m) => (
              <li key={m._id}><button onClick={() => open(m)} className={`block w-full border-b px-4 py-3 text-left hover:bg-brand-light ${sel?._id === m._id ? 'bg-brand-light' : ''}`}>
                <div className="flex items-center justify-between gap-2"><span className={`truncate ${m.status === 'unread' ? 'font-bold' : ''}`}>{m.name}</span><span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${BADGE[m.status]}`}>{m.status}</span></div>
                <p className="truncate text-sm text-gray-600">{m.subject || m.message}</p><p className="text-xs text-gray-400">{fmtDate(m.createdAt)}</p></button></li>))}</ul>
          )}
        </Card>
        <Card className="lg:col-span-3">
          {!sel ? <p className="text-gray-500">Select a message to read it and reply.</p> : (
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-2"><div><h2 className="text-lg font-bold">{sel.subject || 'Message'}</h2><p className="text-sm text-gray-600">{sel.name}{sel.phone && <> · <a href={`tel:${sel.phone}`} className="text-brand underline">{sel.phone}</a></>}{sel.email && <> · <a href={`mailto:${sel.email}`} className="text-brand underline">{sel.email}</a></>}</p><p className="text-xs text-gray-400">{fmtDate(sel.createdAt)}</p></div>
                <button onClick={remove} aria-label="Delete message" className="rounded border p-1.5 text-red-600 hover:bg-red-50"><Trash2 size={15} /></button></div>
              <p className="whitespace-pre-wrap rounded-lg bg-surface p-4 text-sm">{sel.message}</p>
              {sel.reply && <div className="rounded-lg border-l-4 border-brand bg-brand-light p-4 text-sm"><p className="mb-1 text-xs font-semibold text-brand">Your reply · {fmtDate(sel.repliedAt)}</p><p className="whitespace-pre-wrap">{sel.reply}</p></div>}
              <form onSubmit={send} className="space-y-2">
                <label className="text-sm font-medium" htmlFor="reply-box">{sel.reply ? 'Send another reply' : 'Reply'}</label>
                <textarea id="reply-box" rows={3} value={reply} onChange={(e) => setReply(e.target.value)} className={field} />
                {msg && <p role="status" className="text-sm text-gray-700">{msg}</p>}
                <button className={btnPrimary}><Send size={14} className="mr-1 inline" />Send reply</button>
              </form>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
