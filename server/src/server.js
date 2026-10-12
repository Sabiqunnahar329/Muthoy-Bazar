import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import Product from './models/Product.js';
import { uploadDir } from './middleware/upload.js';
import { notFound, errorHandler } from './middleware/error.js';
import authRoutes from './routes/authRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import expenseRoutes from './routes/expenseRoutes.js';
import landingRoutes from './routes/landingRoutes.js';
import staffRoutes from './routes/staffRoutes.js';
import securityRoutes from './routes/securityRoutes.js';
import menuRoutes from './routes/menuRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import supportRoutes from './routes/supportRoutes.js';
import settingRoutes from './routes/settingRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import catalogRoutes from './routes/catalogRoutes.js';
import { loadBlocklist } from './middleware/blocklist.js';
import activityAudit from './middleware/activityAudit.js';

if (!process.env.JWT_SECRET || !process.env.MONGO_URI) {
  console.error('Missing JWT_SECRET or MONGO_URI. Copy .env.example to .env and fill it in.');
  process.exit(1);
}

const app = express();

// Behind a reverse proxy (Nginx, Render, etc.)
if (process.env.TRUST_PROXY) app.set('trust proxy', Number(process.env.TRUST_PROXY) || process.env.TRUST_PROXY);

// Disable helmet headers that conflict with CORS
app.use(
  helmet({
    crossOriginResourcePolicy: false,
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      directives: {
        frameSrc: ["'self'", 'https://www.google.com', 'https://maps.google.com'],
      },
    },
  })
);

// Allow All Origins for smooth cross-domain requests
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: false
  })
);

app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));
app.use('/uploads', express.static(uploadDir));

// Open /api/health to see if the server is up and which database it reads. "products": 0 means the wrong or an empty database.
app.get('/api/health', async (req, res) => {
  const connected = mongoose.connection.readyState === 1;
  let products = null;
  if (connected) {
    try {
      products = await Product.estimatedDocumentCount();
    } catch (error) {
      console.error('Database health check could not read products:', error.message);
      return res.status(503).json({
        ok: false,
        database: { connected, name: mongoose.connection.name },
        products: null,
        message: 'MongoDB is connected, but product data cannot be read. Check that MONGO_URI uses the database allowed for this Atlas user, then run npm run seed.',
      });
    }
  }
  res.json({ ok: true, database: { connected, name: connected ? mongoose.connection.name : null }, products });
});

// Until the database is connected, answer at once with 503 instead of letting requests hang for 10 seconds.
app.use('/api', (req, res, next) => {
  if (mongoose.connection.readyState === 1) return next();
  res.status(503).json({ message: 'The server is starting up. Please try again in a few seconds.' });
});
app.use(activityAudit);
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/landing', landingRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/security', securityRoutes);
app.use('/api/menus', menuRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/catalog', catalogRoutes);
// Optional single-host deploy: if the React app was built (client/build), this server serves it too.
// Then the website and the API live on one domain and no CORS or proxy setup is needed.
const clientBuild = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../client/build');
if (fs.existsSync(path.join(clientBuild, 'index.html'))) {
  app.use(express.static(clientBuild));
  app.get(/^\/(?!api\/|uploads\/).*/, (req, res) => res.sendFile(path.join(clientBuild, 'index.html')));
}

app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 5000;

// Keep trying until the database connects (Atlas can be slow to answer after a restart).
const connectWithRetry = async () => {
  try {
    await connectDB();
    await loadBlocklist();
    console.log('MongoDB connected, blocklist loaded.');
  } catch (e) {
    console.error('Database connection failed, trying again in 5 seconds:', e.message);
    setTimeout(connectWithRetry, 5000);
  }
};

// Listen at once so Render sees the port open, then connect to the database.
app.listen(port, () => {
  console.log(`API running on port ${port}`);
  connectWithRetry();
});
