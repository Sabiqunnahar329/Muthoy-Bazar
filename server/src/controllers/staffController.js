import User, { STAFF_ROLES } from '../models/User.js';
import { asyncHandler, err, PHONE } from '../utils/helpers.js';
import { MODULES, ROLE_DEFAULTS } from '../utils/permissions.js';

const idFilter = (id) => {
  const v = String(id || '').trim().toLowerCase();
  return PHONE.test(v) ? { phone: v } : { email: v };
};
// Only the super admin can create or edit admin-level accounts.
const guardRole = (actor, role) => {
  if (!STAFF_ROLES.includes(role)) throw err(400, 'Choose a valid role');
  if (actor.role !== 'super_admin' && ['super_admin', 'admin'].includes(role)) throw err(403, 'Only the super admin can assign this role');
};
const cleanPerms = (p) => (Array.isArray(p) ? p.filter((m) => MODULES.includes(m)) : []);

export const list = asyncHandler(async (req, res) => {
  const staff = await User.find({ role: { $in: STAFF_ROLES } }).sort('createdAt');
  res.json({ staff, modules: MODULES, roleDefaults: ROLE_DEFAULTS });
});

export const create = asyncHandler(async (req, res) => {
  const { name, identifier, password, role, permissions, active } = req.body;
  guardRole(req.user, role);
  const w = idFilter(identifier);
  if (!name?.trim()) throw err(400, 'Enter a name');
  if (!(w.phone || /^\S+@\S+\.\S+$/.test(w.email))) throw err(400, 'Enter a valid email or 11-digit phone number');
  if (!password || password.length < 6) throw err(400, 'Password must be at least 6 characters');
  if (await User.findOne(w)) throw err(409, 'This email or phone is already registered');
  const u = await User.create({ name: name.trim(), ...w, password, role, permissions: cleanPerms(permissions), active: active !== false });
  res.status(201).json(u);
});

export const update = asyncHandler(async (req, res) => {
  const u = await User.findById(req.params.id);
  if (!u || !STAFF_ROLES.includes(u.role)) throw err(404, 'Staff member not found');
  const { name, role, permissions, active, password } = req.body;
  if (u.role === 'super_admin' && req.user.role !== 'super_admin') throw err(403, 'Only the super admin can edit this account');
  if (role) { guardRole(req.user, role); u.role = role; }
  if (String(u._id) === String(req.user._id) && active === false) throw err(400, 'You cannot disable your own account');
  if (name?.trim()) u.name = name.trim();
  if (permissions) u.permissions = cleanPerms(permissions);
  if (typeof active === 'boolean') u.active = active;
  if (password) { if (password.length < 6) throw err(400, 'Password must be at least 6 characters'); u.password = password; }
  await u.save();
  res.json(u);
});

export const remove = asyncHandler(async (req, res) => {
  const u = await User.findById(req.params.id);
  if (!u || !STAFF_ROLES.includes(u.role)) throw err(404, 'Staff member not found');
  if (String(u._id) === String(req.user._id)) throw err(400, 'You cannot delete your own account');
  if (u.role === 'super_admin') throw err(400, 'The super admin account cannot be deleted');
  await u.deleteOne();
  res.json({ message: 'Deleted' });
});
