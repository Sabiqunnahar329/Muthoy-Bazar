import jwt from 'jsonwebtoken';
import User, { STAFF_ROLES } from '../models/User.js';
import { asyncHandler, err } from '../utils/helpers.js';
import { effective } from '../utils/permissions.js';

const load = async (req) => {
  const h = req.headers.authorization || '';
  if (!h.startsWith('Bearer ')) return null;
  try {
    const { id } = jwt.verify(h.slice(7), process.env.JWT_SECRET);
    const u = await User.findById(id);
    return u && u.active !== false ? u : null;
  } catch {
    return null;
  }
};

export const optionalAuth = asyncHandler(async (req, res, next) => {
  req.user = await load(req);
  next();
});

export const protect = asyncHandler(async (req, res, next) => {
  req.user = await load(req);
  if (!req.user) throw err(401, 'Please log in to continue');
  next();
});

// staff('admin','inventory_manager') limits to those roles. super_admin always passes. No args = any staff role.
export const staff = (...roles) => (req, res, next) => {
  const r = req.user?.role;
  if (!STAFF_ROLES.includes(r)) return next(err(403, 'Admin access only'));
  if (roles.length && r !== 'super_admin' && !roles.includes(r)) return next(err(403, 'Your role cannot do this'));
  next();
};

// can('expenses') limits a route to staff whose permissions include that module (super_admin always passes).
export const can = (module) => (req, res, next) =>
  effective(req.user).includes(module) ? next() : next(err(403, 'You do not have access to this module'));
