const mongoose = require('mongoose');
const Product = require('../models/Product');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/improved-ecommerce';

async function markOnSale() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to DB');

    // Select 10 products (most recently created)
    const products = await Product.find().sort({ createdAt: -1 }).limit(10);
    if (!products || products.length === 0) {
      console.log('No products found to mark on sale.');
      process.exit(0);
    }

    const ids = products.map(p => p._id);
    const names = products.map(p => p.name);

    const res = await Product.updateMany(
      { _id: { $in: ids } },
      { $set: { isOnSale: true } }
    );

    console.log(`Marked ${res.modifiedCount || products.length} products as on sale:`);
    names.forEach(n => console.log(' -', n));
    process.exit(0);
  } catch (err) {
    console.error('Error marking on-sale products:', err);
    process.exit(1);
  }
}

markOnSale();
