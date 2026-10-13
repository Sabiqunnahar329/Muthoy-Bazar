import crypto from 'crypto';
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
  const accessCode = crypto.randomBytes(32).toString('hex');
  const accessTokenHash = crypto.createHash('sha256').update(accessCode).digest('hex');
  const m = await Message.create({
    user: req.user?._id,
    accessTokenHash,
    name: name.trim(),
    phone: phone.trim(),
    email: email.trim(),
    subject: subject.trim().slice(0, 120),
    message: message.trim().slice(0, 2000),
    source: source === 'support' ? 'support' : 'contact',
    thread: [{ sender: 'customer', text: message.trim().slice(0, 2000) }],
  });
  notify({ type: 'support', title: `New message from ${m.name}`, message: m.subject || m.message.slice(0, 80), link: '/admin/support-mailbox' });
  res.status(201).json({ message: 'Thank you! We have received your message.', accessCode });
});

const accessHash = (value) => (
  typeof value === 'string' && /^[a-f\d]{64}$/i.test(value)
    ? crypto.createHash('sha256').update(value.toLowerCase()).digest('hex')
    : null
);

const inboxQuery = (req, accessCodes = []) => {
  const options = [];
  if (req.user?._id) {
    options.push({ user: req.user._id });
    if (req.user.phone) options.push({ phone: req.user.phone });
    if (req.user.email) options.push({ email: req.user.email });
  }
  const hashes = [...new Set((Array.isArray(accessCodes) ? accessCodes : []).slice(0, 50).map(accessHash).filter(Boolean))];
  if (hashes.length) options.push({ accessTokenHash: { $in: hashes } });
  return options.length ? { $or: options } : null;
};

const inboxMessage = (message) => ({
  _id: message._id,
  name: message.name,
  subject: message.subject,
  message: message.message,
  reply: message.reply,
  thread: message.thread?.length
    ? message.thread
    : [
        { sender: 'customer', text: message.message, createdAt: message.createdAt },
        ...(message.reply ? [{ sender: 'admin', text: message.reply, createdAt: message.repliedAt }] : []),
      ],
  status: message.status,
  createdAt: message.createdAt,
  repliedAt: message.repliedAt,
  unreadReply: message.status === 'replied' && !message.replyReadAt,
});

export const inbox = asyncHandler(async (req, res) => {
  const query = inboxQuery(req, req.body.accessCodes);
  if (!query) return res.json([]);
  const messages = await Message.find(query).sort('-createdAt').limit(100);
  res.json(messages.map(inboxMessage));
});

export const markInboxRead = asyncHandler(async (req, res) => {
  const query = inboxQuery(req, req.body.accessCodes);
  if (!query) throw err(404, 'Message not found');
  const message = await Message.findOne({ _id: req.params.id, ...query });
  if (!message) throw err(404, 'Message not found');
  if (message.status === 'replied' && !message.replyReadAt) {
    message.replyReadAt = new Date();
    await message.save();
  }
  res.json(inboxMessage(message));
});

export const customerReply = asyncHandler(async (req, res) => {
  const text = String(req.body.message || '').trim();
  if (text.length < 2) throw err(400, 'Write a message first');
  if (text.length > 2000) throw err(400, 'Message must be 2000 characters or fewer');

  const query = inboxQuery(req, req.body.accessCodes);
  if (!query) throw err(404, 'Message not found');
  const message = await Message.findOne({ _id: req.params.id, ...query }).select('+accessTokenHash');
  if (!message) throw err(404, 'Message not found');

  if (!message.thread.length) {
    message.thread.push({ sender: 'customer', text: message.message, createdAt: message.createdAt });
    if (message.reply) message.thread.push({ sender: 'admin', text: message.reply, createdAt: message.repliedAt });
  }
  message.thread.push({ sender: 'customer', text });
  message.status = 'unread';
  message.replyReadAt = undefined;
  await message.save();
  notify({ type: 'support', title: `New reply from ${message.name}`, message: text.slice(0, 80), link: '/admin/support-mailbox' });
  res.json(inboxMessage(message));
});

export const resetGuestInboxCode = asyncHandler(async (req, res) => {
  const message = await Message.findById(req.params.id).select('+accessTokenHash');
  if (!message) throw err(404, 'Message not found');
  if (message.user) throw err(409, 'This message is linked to a customer account');

  const accessCode = crypto.randomBytes(32).toString('hex');
  message.accessTokenHash = crypto.createHash('sha256').update(accessCode).digest('hex');
  await message.save();
  if (message.phone) sendSms(message.phone, `Muthoy Bazar inbox access code: ${accessCode}`);
  res.json({ accessCode, sentBySms: !!message.phone });
});

export const list = asyncHandler(async (req, res) => {
  const { status, source, search } = req.query;
  const q = {};
  if (['unread', 'read', 'replied'].includes(status)) q.status = status;
  if (['contact', 'support'].includes(source)) q.source = source;
  if (search) { const rx = new RegExp(escapeRegex(search), 'i'); q.$or = [{ name: rx }, { subject: rx }, { message: rx }, { phone: rx }, { 'thread.text': rx }]; }
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
  if (!m.thread.length) {
    m.thread.push({ sender: 'customer', text: m.message, createdAt: m.createdAt });
    if (m.reply) m.thread.push({ sender: 'admin', text: m.reply, createdAt: m.repliedAt });
  }
  m.reply = text; m.status = 'replied'; m.repliedAt = new Date(); m.replyReadAt = undefined;
  m.thread.push({ sender: 'admin', text, createdAt: m.repliedAt });
  await m.save();
  if (m.phone) sendSms(m.phone, `Muthoy Bazar: ${text}`.slice(0, 300)); // email replies need an email service
  res.json(m);
});

export const remove = asyncHandler(async (req, res) => { await Message.findByIdAndDelete(req.params.id); res.json({ message: 'Deleted' }); });
