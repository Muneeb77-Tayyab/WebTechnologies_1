const express = require('express');
const router = express.Router();
const Order = require('../../models/Order');
const Product = require('../../models/Product');
const { requireAuth, requireAdmin } = require('../../middlewares/apiAuth');
const { body, validationResult } = require('express-validator');

// ─────────────────────────────────────────────────────────
// GET /api/v1/orders  — all orders (admin only)
// ─────────────────────────────────────────────────────────
router.get('/', requireAdmin, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('items.product', 'name price')
      .sort('-createdAt');
    res.json(orders);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// ─────────────────────────────────────────────────────────
// GET /api/v1/orders/:id  — single order (admin only)
// ─────────────────────────────────────────────────────────
router.get('/:id', requireAdmin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('items.product', 'name price');
    if (!order) return res.status(404).json({ msg: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ msg: 'Server Error' });
  }
});

// ─────────────────────────────────────────────────────────
// POST /api/v1/orders  — place an order (any logged-in user)
// Body: { items: [{ productId, quantity }], shippingInfo: { address, city, zip, country, phone } }
// ─────────────────────────────────────────────────────────
router.post('/', requireAuth, [
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('shippingInfo.address').notEmpty().withMessage('Address is required'),
  body('shippingInfo.city').notEmpty().withMessage('City is required'),
  body('shippingInfo.zip').notEmpty().withMessage('ZIP code is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { items, shippingInfo } = req.body;
    let total = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ msg: `Product not found: ${item.productId}` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ msg: `Insufficient stock for "${product.name}". Available: ${product.stock}` });
      }
      orderItems.push({ product: product._id, quantity: item.quantity, price: product.price });
      total += product.price * item.quantity;
    }

    const order = new Order({
      user: req.user.id,
      items: orderItems,
      total,
      shippingInfo
    });
    await order.save();

    // Decrement stock after successful order
    for (const item of items) {
      await Product.findByIdAndUpdate(item.productId, { $inc: { stock: -item.quantity } });
    }

    res.status(201).json(order);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// ─────────────────────────────────────────────────────────
// PUT /api/v1/orders/:id/status  — update status (admin only)
// ─────────────────────────────────────────────────────────
router.put('/:id/status', requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!order) return res.status(404).json({ msg: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ msg: 'Server Error' });
  }
});

module.exports = router;
