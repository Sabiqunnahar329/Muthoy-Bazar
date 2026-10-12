import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, PackageX, MessageSquare, Info, Trash2, CheckCheck } from 'lucide-react';
import api from '../lib/api.js';
import { Card } from './ui.jsx';

const ICON = { order: ShoppingBag, stock: PackageX, support: MessageSquare, system: Info };
const ago = (d) => { const m = Math.round((Date.now() - new Date(d)) / 60000); return m < 1 ? 'just now' : m < 60 ? `${m} min ago` : m < 1440 ? `${Math.round(m / 60)} h ago` : new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }); };

export default function AdminNotifications() {
  const [list, setList] = useState(null);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const navigate = useNavigate();

  const load = () => api.get('/notifications', { params: { unread: unreadOnly ? 1 : 0 } }).then((r) => setList(r.data)).catch(() => setList([]));
  useEffect(() => { load(); const id = setInterval(load, 30000); return () => clearInterval(id); }, [unreadOnly]); // eslint-disable-line react-hooks/exhaustive-deps

  const openOne = async (n) => { if (!n.read) await api.patch(`/notifications/${n._id}/read`).catch(() => {}); if (n.link) navigate(n.link); else load(); };
  const unread = (list || []).filter((n) => !n.read).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">Notifications {unread > 0 && <span className="ml-1 rounded-full bg-cta px-2 py-0.5 align-middle text-sm text-white">{unread}</span>}</h1>
        <div className="flex flex-wrap gap-2">
          <label className="flex items-center gap-2 rounded-lg border bg-white px-3 py-2 text-sm"><input type="checkbox" checked={unreadOnly} onChange={(e) => setUnreadOnly(e.target.checked)} />Unread only</label>
          <button onClick={() => api.patch('/notifications/read-all').then(load)} className="rounded-lg border bg-white px-3 py-2 text-sm hover:bg-gray-50"><CheckCheck size={15} className="mr-1 inline" />Mark all as read</button>
          <button onClick={() => api.delete('/notifications/read').then(load)} className="rounded-lg border bg-white px-3 py-2 text-sm hover:bg-gray-50">Clear read</button>
        </div>
      </div>
      <Card className="p-0">
        {list === null ? <p className="p-5 text-gray-500">Loading…</p> : list.length === 0 ? <p className="p-5 text-gray-500">{unreadOnly ? 'No unread notifications.' : 'No notifications yet. New orders, low stock and customer messages will show here.'}</p> : (
          <ul>{list.map((n) => { const Icon = ICON[n.type] || Info; return (
            <li key={n._id} className={`flex items-start gap-3 border-b px-4 py-3 last:border-0 ${n.read ? '' : 'bg-brand-light/60'}`}>
              <span className={`mt-0.5 rounded-full p-2 ${n.type === 'stock' ? 'bg-red-100 text-red-700' : 'bg-brand-light text-brand'}`}><Icon size={16} /></span>
              <button onClick={() => openOne(n)} className="min-w-0 flex-1 text-left"><p className={`${n.read ? '' : 'font-bold'}`}>{n.title}</p><p className="truncate text-sm text-gray-600">{n.message}</p></button>
              <span className="whitespace-nowrap text-xs text-gray-500">{ago(n.createdAt)}</span>
              {!n.read && <span className="mt-2 h-2.5 w-2.5 rounded-full bg-cta" aria-label="Unread" />}
              <button onClick={() => api.delete(`/notifications/${n._id}`).then(load)} aria-label="Delete notification" className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-red-600"><Trash2 size={15} /></button>
            </li>); })}</ul>
        )}
      </Card>
    </div>
  );
}
