import 'dotenv/config';
import mongoose from 'mongoose';
import Category from './models/Category.js';
import Product from './models/Product.js';
import User from './models/User.js';
import categoryData from './data/categories.js';
import productData from './data/products.js';

// Usage: npm run seed            (adds the catalog if empty, creates the admin account)
//        npm run seed -- --fresh (wipes categories and products first)
await mongoose.connect(process.env.MONGO_URI);

if (process.argv.includes('--fresh')) {
  await Promise.all([Category.deleteMany({}), Product.deleteMany({})]);
  console.log('Cleared categories and products');
}

if (!(await Category.countDocuments())) {
  const cats = await Category.insertMany(categoryData.split('\n').map((l) => { const [name, description] = l.split('|'); return { name, description }; }));
  const id = Object.fromEntries(cats.map((c) => [c.name, c._id]));
  await Product.create(productData.map((p) => ({ ...p, category: id[p.category] })));
  console.log(`Added ${cats.length} categories and ${productData.length} products`);
} else {
  console.log('Catalog already exists. Use --fresh to replace it.');
}

const email = (process.env.ADMIN_EMAIL || 'admin@muthoybazar.com').toLowerCase();
if (!(await User.findOne({ email }))) {
  await User.create({ name: process.env.ADMIN_NAME || 'Super Admin', email, password: process.env.ADMIN_PASSWORD || 'ChangeMe123', role: 'super_admin' });
  console.log(`Admin created: ${email}`);
}
await mongoose.disconnect();
