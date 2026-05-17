const express = require('express');
const router = express.Router();
const Product = require('../../models/Product');
const Category = require('../../models/Category');
const User = require('../../models/User');
const Order = require('../../models/Order');

router.get('/', async (req, res) => {
  try {
    const productCount = await Product.countDocuments();
    const categoryCount = await Category.countDocuments();
    const userCount = await User.countDocuments();
    const orderCount = await Order.countDocuments();

    res.render('admin/dashboard', {
      title: 'Admin Dashboard',
      productCount,
      categoryCount,
      userCount,
      orderCount
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
