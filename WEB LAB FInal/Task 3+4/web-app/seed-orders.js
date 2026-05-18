require('dotenv').config();
const mongoose = require('mongoose');
const Order = require('./models/Order');
const User = require('./models/User');
const Product = require('./models/Product');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/improved-ecommerce';

async function seedOrders() {
  try {
    await mongoose.connect(MONGO_URI);
    
    // Get a user and a product
    const user = await User.findOne({ role: 'customer' });
    const product = await Product.findOne();

    if (!user || !product) {
      console.log('No users or products found to create an order.');
      process.exit(1);
    }

    // Create a dummy order
    await Order.create({
      user: user._id,
      items: [{
        product: product._id,
        quantity: 1,
        price: product.price
      }],
      total: product.price,
      shippingInfo: {
        address: '123 Fake Street',
        city: 'New York',
        zip: '10001'
      },
      status: 'pending'
    });

    console.log('✅ Dummy order successfully created!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding order:', err);
    process.exit(1);
  }
}

seedOrders();
