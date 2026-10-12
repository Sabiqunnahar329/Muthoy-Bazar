import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import { asyncHandler, err, PHONE } from '../utils/helpers.js';
import { sendSms } from '../utils/sms.js';
import { effective } from '../utils/permissions.js';

const sign = (u) => jwt.sign({ id: u._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
const pub = (u) => ({ _id: u._id, name: u.name, role: u.role, email: u.email, phone: u.phone, permissions: effective(u) });
const where = (id) => {
  const v = String(id || '').trim().toLowerCase();
  return PHONE.test(v) ? { phone: v } : { email: v };
};
const hash = (c) => crypto.createHash('sha256').update(c).digest('hex');

export const register = asyncHandler(async (req, res) => {
  const { name, identifier, password } = req.body;
  const w = where(identifier);
  const ok = w.phone || /^\S+@\S+\.\S+$/.test(w.email);
  if (!name?.trim()) throw err(400, 'Enter your name');
  if (!ok) throw err(400, 'Enter a valid email or 11-digit phone number');
  if (!password || password.length < 6) throw err(400, 'Password must be at least 6 characters');
  if (await User.findOne(w)) throw err(409, 'This email or phone is already registered');
  const user = await User.create({ name: name.trim(), ...w, password });
  res.status(201).json({ token: sign(user), user: pub(user) });
});

export const login = asyncHandler(async (req, res) => {
  const user = await User.findOne(where(req.body.identifier)).select('+password');
  if (!user || !(await user.matchPassword(req.body.password || ''))) throw err(401, 'Email, phone or password is incorrect');
  if (user.active === false) throw err(403, 'This account has been disabled. Contact the store owner.');
  res.json({ token: sign(user), user: pub(user) });
});

export const me = (req, res) => res.json(pub(req.user));

// Always answers the same message so the endpoint cannot be used to find registered accounts.
export const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne(where(req.body.identifier));
  let devCode;
  if (user) {
    const code = String(crypto.randomInt(100000, 1000000));
    user.resetCode = hash(code);
    user.resetExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();
    if (user.phone) await sendSms(user.phone, `Muthoy Bazar password reset code: ${code}`);
    else console.log(`[EMAIL to ${user.email}] Password reset code: ${code}`); // plug in an email service here
    if (process.env.NODE_ENV !== 'production') devCode = code;
  }
  res.json({ message: 'If this account exists, a reset code has been sent.', devCode });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { identifier, code, password } = req.body;
  if (!password || password.length < 6) throw err(400, 'Password must be at least 6 characters');
  const user = await User.findOne(where(identifier)).select('+resetCode +resetExpires');
  if (!user || !user.resetCode || user.resetExpires < new Date() || user.resetCode !== hash(String(code || '').trim()))
    throw err(400, 'The code is wrong or has expired');
  user.password = password;
  user.resetCode = undefined;
  user.resetExpires = undefined;
  await user.save();
  res.json({ message: 'Password updated' });
});
