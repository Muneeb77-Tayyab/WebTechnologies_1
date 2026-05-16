const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const Order = require('../../models/Order');
const { requireAuth } = require('../../middlewares/apiAuth');

// ─────────────────────────────────────────────────────────
// GET /api/v1/user/profile
// Returns: authenticated user's profile + their order history
// ─────────────────────────────────────────────────────────
router.get('/profile', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ msg: 'User not found' });

    const orders = await Order.find({ user: req.user.id })
      .populate('items.product', 'name price image')
      .sort('-createdAt');

    res.json({ user, orders });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

module.exports = router;
