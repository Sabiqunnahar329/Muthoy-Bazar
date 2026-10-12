import Blacklist from '../models/Blacklist.js';

// In-memory copy of the blacklist so every request does not hit the database.
// (Single server instance. With several instances, reload on a timer or use Redis.)
const cache = { phone: new Set(), ip: new Set() };

export const normIp = (ip) => String(ip || '').replace(/^::ffff:/, '');

export async function loadBlocklist() {
  const rows = await Blacklist.find().lean();
  cache.phone = new Set(rows.filter((r) => r.type === 'phone').map((r) => r.value));
  cache.ip = new Set(rows.filter((r) => r.type === 'ip').map((r) => r.value));
}

const BLOCKED = 'Your access has been blocked. Please contact support if you think this is a mistake.';

// Put on public routes that can be abused (placing orders, registering). Admin routes are never blocked.
export const blockCheck = (req, res, next) => {
  if (cache.ip.has(normIp(req.ip))) return res.status(403).json({ message: BLOCKED });
  const phone = req.body?.customer?.phone || req.body?.phone || req.body?.identifier;
  if (phone && cache.phone.has(String(phone).trim())) return res.status(403).json({ message: BLOCKED });
  next();
};
