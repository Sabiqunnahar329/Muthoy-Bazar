import Notification from '../models/Notification.js';
import { asyncHandler } from '../utils/helpers.js';

export const list = asyncHandler(async (req, res) => {
  const q = req.query.unread === '1' ? { read: false } : {};
  res.json(await Notification.find(q).sort('-createdAt').limit(200));
});
export const markRead = asyncHandler(async (req, res) => res.json(await Notification.findByIdAndUpdate(req.params.id, { read: true }, { new: true })));
export const markAllRead = asyncHandler(async (req, res) => { await Notification.updateMany({ read: false }, { read: true }); res.json({ message: 'Done' }); });
export const remove = asyncHandler(async (req, res) => { await Notification.findByIdAndDelete(req.params.id); res.json({ message: 'Deleted' }); });
export const clearRead = asyncHandler(async (req, res) => { await Notification.deleteMany({ read: true }); res.json({ message: 'Cleared' }); });
