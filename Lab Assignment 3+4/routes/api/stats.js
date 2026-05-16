const express = require('express');
const router = express.Router();
const Product  = require('../../models/Product');
const Category = require('../../models/Category');
const Order    = require('../../models/Order');
const User     = require('../../models/User');
const { requireAdmin } = require('../../middlewares/apiAuth');

// ─────────────────────────────────────────────────────────
// GET /api/v1/stats  — dashboard stats (admin only)
// Returns: counts + total revenue
// ─────────────────────────────────────────────────────────
router.get('/', requireAdmin, async (req, res) => {
  try {
    const [products, categories, orders, users, revenueResult] = await Promise.all([
      Product.countDocuments(),
      Category.countDocuments(),
      Order.countDocuments(),
      User.countDocuments(),
      Order.aggregate([
        { $match: { status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ])
    ]);

    res.json({
      products,
      categories,
      orders,
      users,
      totalRevenue: revenueResult[0]?.total || 0
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

module.exports = router;
