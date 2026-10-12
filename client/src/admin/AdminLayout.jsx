import { useEffect, useState } from 'react';
import { NavLink, Navigate, Outlet, Link } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingCart, Boxes, User, Wallet, Ticket, PanelsTopLeft, UserCog,
  BarChart3, Globe, Image as ImageIcon, SearchCheck, ShieldCheck, Menu, Bell, Activity, Mail,
  MessageSquareText, Infinity as InfinityIcon, ShoppingBag, Settings, Server, ArrowLeft, LogOut, X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';

// perm = the module a staff member needs access to (set in Staff Management). badge = unread counter key.
const GROUPS = [
  { label: null, items: [{ to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true, perm: 'dashboard' }] },
  {
    label: 'Apps & Pages',
    items: [
      { to: '/admin/products', label: 'Product', icon: Package, perm: 'products' },
      { to: '/admin/sales', label: 'Sales', icon: ShoppingCart, perm: 'sales' },
      { to: '/admin/stock', label: 'Stock Management', icon: Boxes, perm: 'stock' },
      { to: '/admin/customers', label: 'Customer', icon: User, perm: 'customers' },
      { to: '/admin/expenses', label: 'Expenses', icon: Wallet, perm: 'expenses' },
      { to: '/admin/coupons', label: 'Coupons', icon: Ticket, perm: 'coupons' },
      { to: '/admin/landing-pages', label: 'Landing Page', icon: PanelsTopLeft, perm: 'landing' },
      { to: '/admin/staff', label: 'Staff Management', icon: UserCog, perm: 'staff' },
    ],
  },
  {
    label: 'Reports',
    items: [
      { to: '/admin/reports', label: 'Report', icon: BarChart3, perm: 'reports' },
      { to: '/admin/website', label: 'Website', icon: Globe, perm: 'settings' },
      { to: '/admin/image-rules', label: 'Image rules', icon: ImageIcon, perm: 'products' },
      { to: '/admin/fraud-checker', label: 'Fraud Checker', icon: SearchCheck, perm: 'security' },
      { to: '/admin/ip-block', label: 'IP Block', icon: ShieldCheck, perm: 'security' },
      { to: '/admin/menu-builder', label: 'Menu Builder', icon: Menu, perm: 'menu' },
      { to: '/admin/notifications', label: 'Notifications', icon: Bell, perm: 'notifications', badge: 'notifications' },
      { to: '/admin/activity-log', label: 'Activity Log', icon: Activity, perm: 'settings' },
      { to: '/admin/support-mailbox', label: 'Support Mailbox', icon: Mail, perm: 'support', badge: 'support' },
      { to: '/admin/contact-queries', label: 'Contact Form Queries', icon: MessageSquareText, perm: 'support' },
      { to: '/admin/pixel-stats', label: 'Pixel Stats', icon: InfinityIcon, perm: 'reports' },
      { to: '/admin/meta-catalog', label: 'Meta Catalog', icon: ShoppingBag, perm: 'products' },
      { to: '/admin/configurations', label: 'Configurations', icon: Settings, perm: 'settings' },
      { to: '/admin/server-stats', label: 'Server Stats', icon: Server, perm: 'settings' },
    ],
  },
];

export default function AdminLayout() {
  const { user, isStaff, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [counts, setCounts] = useState({ notifications: 0, support: 0 });

  useEffect(() => {
    if (!user || !isStaff) return undefined;
    const load = () => api.get('/admin/counts').then((r) => setCounts(r.data)).catch(() => {});
    load();
    const id = setInterval(load, 30000);
    return () => clearInterval(id);
  }, [user, isStaff]);

  // Clear the saved login (token and user in localStorage, and the auth context), then go to the website home page.
  // A full page load makes sure no admin data stays in memory.
  const handleLogout = () => {
    setLeaving(true); // stops the login redirect below from running while we leave
    logout();
    window.location.replace('/');
  };

  if (leaving) return null;
  if (!user || !isStaff) return <Navigate to="/login?redirect=/admin" replace />;

  // Older saved logins have no permission list: show everything (the server still enforces access).
  const allowed = (perm) => user.role === 'super_admin' || !user.permissions || user.permissions.includes(perm);
  const groups = GROUPS.map((g) => ({ ...g, items: g.items.filter((i) => allowed(i.perm)) })).filter((g) => g.items.length);

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
      isActive ? 'bg-brand text-white shadow' : 'text-gray-700 hover:bg-brand-light'
    }`;

  return (
    <div className="min-h-screen bg-surface lg:flex">
      {open && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setOpen(false)} />}

      <aside className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r bg-white transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between border-b px-4 py-3">
          <Link to="/admin" className="flex items-center gap-2">
            <img src="/logo.png" alt="" className="h-10 w-10 object-contain" />
            <span className="font-bold text-brand">Muthoy Bazar</span>
          </Link>
          <button className="lg:hidden" onClick={() => setOpen(false)} aria-label="Close menu"><X size={20} /></button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-3" aria-label="Admin">
          {groups.map((g, i) => (
            <div key={i} className="space-y-1">
              {g.label && <p className="px-3 pb-1 pt-4 text-xs font-semibold uppercase tracking-wider text-gray-400">{g.label}</p>}
              {g.items.map(({ to, label, icon: Icon, end, badge }) => (
                <NavLink key={to} to={to} end={end} onClick={() => setOpen(false)} className={linkClass}>
                  <Icon size={18} /> <span className="flex-1">{label}</span>
                  {badge && counts[badge] > 0 && <span className="rounded-full bg-cta px-2 py-0.5 text-xs font-bold text-white" aria-label={`${counts[badge]} unread`}>{counts[badge]}</span>}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="border-t p-3">
          <Link to="/" className="flex w-full items-center justify-center gap-2 rounded-lg bg-cta py-2.5 font-semibold text-white hover:bg-cta-dark">
            <ArrowLeft size={18} /> Back to Website
          </Link>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b bg-white px-4 py-3">
          <button className="rounded-lg border p-2 lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu"><Menu size={20} /></button>
          <Link to="/" className="hidden items-center gap-2 text-sm font-medium text-brand hover:underline lg:flex"><ArrowLeft size={16} /> Back to Website</Link>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-gray-600">{user.name} <span className="rounded-full bg-brand-light px-2 py-0.5 text-xs text-brand">{user.role}</span></span>
            <button onClick={handleLogout} className="flex items-center gap-1 rounded-lg border px-3 py-1.5 hover:bg-gray-50"><LogOut size={16} /> Logout</button>
          </div>
        </header>
        <main className="p-4 sm:p-6"><Outlet /></main>
      </div>
    </div>
  );
}
