import Message from '../models/Message.js';
import { asyncHandler, err, PHONE, escapeRegex } from '../utils/helpers.js';
import { notify } from '../utils/notify.js';
import { sendSms } from '../utils/sms.js';

// Public contact form
export const create = asyncHandler(async (req, res) => {
  const { name, phone = '', email = '', subject = '', message, source } = req.body;
  if (!name?.trim()) throw err(400, 'Enter your name');
  if (!PHONE.test(phone) && !/^\S+@\S+\.\S+$/.test(email)) throw err(400, 'Enter a valid phone number or email so we can reply');
  if (!message || message.trim().length < 5) throw err(400, 'Write your message (at least 5 characters)');
  const m = await Message.create({ name: name.trim(), phone: phone.trim(), email: email.trim(), subject: subject.trim().slice(0, 120), message: message.trim().slice(0, 2000), source: source === 'support' ? 'support' : 'contact' });
  notify({ type: 'support', title: `New message from ${m.name}`, message: m.subject || m.message.slice(0, 80), link: '/admin/support-mailbox' });
  res.status(201).json({ message: 'Thank you! We have received your message.' });
});

export const list = asyncHandler(async (req, res) => {
  const { status, source, search } = req.query;
  const q = {};
  if (['unread', 'read', 'replied'].includes(status)) q.status = status;
  if (['contact', 'support'].includes(source)) q.source = source;
  if (search) { const rx = new RegExp(escapeRegex(search), 'i'); q.$or = [{ name: rx }, { subject: rx }, { message: rx }, { phone: rx }]; }
  res.json(await Message.find(q).sort('-createdAt').limit(200));
});

export const markRead = asyncHandler(async (req, res) => {
  const m = await Message.findById(req.params.id);
  if (!m) throw err(404, 'Message not found');
  if (m.status === 'unread') { m.status = 'read'; await m.save(); }
  res.json(m);
});

export const reply = asyncHandler(async (req, res) => {
  const text = String(req.body.reply || '').trim();
  if (text.length < 2) throw err(400, 'Write a reply first');
  const m = await Message.findById(req.params.id);
  if (!m) throw err(404, 'Message not found');
  m.reply = text; m.status = 'replied'; m.repliedAt = new Date();
  await m.save();
  if (m.phone) sendSms(m.phone, `Muthoy Bazar: ${text}`.slice(0, 300)); // email replies need an email service
  res.json(m);
});

export const remove = asyncHandler(async (req, res) => { await Message.findByIdAndDelete(req.params.id); res.json({ message: 'Deleted' }); });
