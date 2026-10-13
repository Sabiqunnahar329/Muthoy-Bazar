import 'dotenv/config';
import mongoose from 'mongoose';
import Category from './models/Category.js';
import Product from './models/Product.js';
import User from './models/User.js';
import categoryData from './data/categories.js';
import productData from './data/products.js';

const categoryDefinitions = categoryData.split('\n').map((line) => {
  const [name, description] = line.split('|');
  return { name, description };
});

// Usage: npm run seed            (adds the catalog if empty, creates the admin account)
//        npm run seed -- --fresh (wipes categories and products first)
await mongoose.connect(process.env.MONGO_URI);

if (process.argv.includes('--fresh')) {
  await Promise.all([Category.deleteMany({}), Product.deleteMany({})]);
  console.log('Cleared categories and products');
}

if (!(await Category.countDocuments())) {
  const cats = await Category.insertMany(categoryDefinitions);
  const id = Object.fromEntries(cats.map((c) => [c.name, c._id]));
  await Product.create(productData.map((p) => ({ ...p, category: id[p.category] })));
  console.log(`Added ${cats.length} categories and ${productData.length} products`);
} else {
  console.log('Catalog already exists. Use --fresh to replace it.');
}

for (const [sourceName, targetName] of [['Seeds', 'Dry Fruits'], ['Peanut Butter', 'Snacks']]) {
  const targetDefinition = categoryDefinitions.find(({ name }) => name === targetName);
  if (!targetDefinition) throw new Error(`Missing category definition for ${targetName}`);
  const target = await Category.findOneAndUpdate(
    { name: targetName },
    { $set: { description: targetDefinition.description } },
    { new: true, upsert: true }
  );
  const source = await Category.findOne({ name: sourceName });
  if (source) {
    const result = await Product.updateMany({ category: source._id }, { $set: { category: target._id } });
    await source.deleteOne();
    console.log(`Moved ${result.modifiedCount} products from ${sourceName} to ${targetName}`);
  }
}

const translatedProducts = productData.filter((product) => product.nameBn);
const translationResult = await Product.bulkWrite(translatedProducts.map((product) => ({
  updateOne: {
    filter: { name: product.name },
    update: { $set: { nameBn: product.nameBn } },
  },
})));
console.log(`Added Bengali names to ${translationResult.modifiedCount} existing products.`);

const email = (process.env.ADMIN_EMAIL || 'admin@muthoybazar.com').toLowerCase();
if (!(await User.findOne({ email }))) {
  await User.create({ name: process.env.ADMIN_NAME || 'Super Admin', email, password: process.env.ADMIN_PASSWORD || 'ChangeMe123', role: 'super_admin' });
  console.log(`Admin created: ${email}`);
}
await mongoose.disconnect();
