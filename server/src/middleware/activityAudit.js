import ActivityLog from '../models/ActivityLog.js';
import { STAFF_ROLES } from '../models/User.js';

const METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
const RESOURCES = {
  admin: 'Admin dashboard',
  categories: 'Category',
  products: 'Product',
  orders: 'Order',
  coupons: 'Coupon',
  expenses: 'Expense',
  landing: 'Landing page',
  staff: 'Staff account',
  security: 'Security rule',
  menus: 'Menu',
  notifications: 'Notification',
  support: 'Support message',
  settings: 'Store settings',
  auth: 'Account',
};
const VERBS = { POST: 'Created', PUT: 'Updated', PATCH: 'Updated', DELETE: 'Deleted' };

export default function activityAudit(req, res, next) {
  if (!METHODS.has(req.method) || !req.originalUrl.startsWith('/api/')) return next();

  res.once('finish', () => {
    const user = req.user;
    if (res.statusCode < 200 || res.statusCode >= 300 || !user || !STAFF_ROLES.includes(user.role)) return;

    const segments = req.originalUrl.split('?')[0].split('/').filter(Boolean);
    const resourceKey = segments[1] || 'admin';
    if (!RESOURCES[resourceKey]) return;
    const resource = RESOURCES[resourceKey] || resourceKey;
    const verb = req.method === 'POST' && segments.length > 2 ? 'Changed' : VERBS[req.method];

    ActivityLog.create({
      actor: user._id,
      actorName: user.name,
      actorRole: user.role,
      action: `${verb} ${resource}`,
      resource,
    }).catch((error) => console.error('Could not record admin activity:', error.message));
  });

  next();
}
