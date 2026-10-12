import mongoose from 'mongoose';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import Message from '../models/Message.js';
import Blacklist from '../models/Blacklist.js';
import { asyncHandler } from '../utils/helpers.js';

const STATES = ['Disconnected', 'Connected', 'Connecting', 'Disconnecting'];

export const serverStats = asyncHandler(async (req, res) => {
  const mem = process.memoryUsage();
  const [products, orders, users, blocked] = await Promise.all([Product.estimatedDocumentCount(), Order.estimatedDocumentCount(), User.estimatedDocumentCount(), Blacklist.estimatedDocumentCount()]);
  res.json({
    database: { state: STATES[mongoose.connection.readyState] || 'Unknown', name: mongoose.connection.name, host: mongoose.connection.host },
    uptimeSeconds: Math.round(process.uptime()),
    memoryMb: { rss: Math.round(mem.rss / 1048576), heap: Math.round(mem.heapUsed / 1048576) },
    node: process.version, platform: process.platform, environment: process.env.NODE_ENV || 'development',
    counts: { products, orders, users, blocked }, serverTime: new Date().toISOString(),
  });
});

// Unread badges for the admin sidebar
export const counts = asyncHandler(async (req, res) => {
  const [notifications, support] = await Promise.all([Notification.countDocuments({ read: false }), Message.countDocuments({ status: 'unread' })]);
  res.json({ notifications, support });
});
