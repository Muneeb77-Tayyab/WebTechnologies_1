const express = require('express');
const router = express.Router();
const Product = require('../../models/Product');
const Category = require('../../models/Category');
const { requireAdmin } = require('../../middlewares/apiAuth');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Multer config (shared file filter)
const storage = multer.diskStorage({
  destination: './public/uploads/products',
  filename: (req, file, cb) => {
    cb(null, 'product-' + Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) return cb(null, true);
    cb(new Error('Images only (jpeg, jpg, png, gif, webp)'));
  }
});

// ─────────────────────────────────────────────────────────────────
// GET /api/v1/products  — public, supports pagination + filtering
// Query params: ?q= ?category= ?minPrice= ?maxPrice= ?page= ?limit=
// ─────────────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 8;
    const skip  = (page - 1) * limit;

    const query = {};

    // Search by name
    if (req.query.q) {
      query.name = { $regex: req.query.q, $options: 'i' };
    }

    // Filter by category slug
    if (req.query.category) {
      const cat = await Category.findOne({ slug: req.query.category });
      if (cat) query.category = cat._id;
    }

    // Price range
    if (req.query.minPrice || req.query.maxPrice) {
      query.price = {};
      if (req.query.minPrice) query.price.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) query.price.$lte = Number(req.query.maxPrice);
    }

    const total    = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('category', 'name slug')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.json({
      products,
      pagination: { total, page, pages: Math.ceil(total / limit), limit }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// ─────────────────────────────────────────────────────────────────
// GET /api/v1/products/:id  — single product (public)
// ─────────────────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name slug');
    if (!product) return res.status(404).json({ msg: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ msg: 'Server Error' });
  }
});

// ─────────────────────────────────────────────────────────────────
// POST /api/v1/products  — create (admin only)
// ─────────────────────────────────────────────────────────────────
router.post('/', requireAdmin, upload.single('image'), [
  body('name').notEmpty().withMessage('Name is required'),
  body('price').isNumeric().withMessage('Price must be a number'),
  body('category').notEmpty().withMessage('Category is required'),
  body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be a positive integer'),
  body('rating').optional().isFloat({ min: 0, max: 5 }).withMessage('Rating must be between 0 and 5')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { name, description, price, category, stock, rating } = req.body;
    const image = req.file
      ? `/uploads/products/${req.file.filename}`
      : undefined;

    const product = new Product({ name, description, price, category, stock, rating, image });
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// ─────────────────────────────────────────────────────────────────
// PUT /api/v1/products/:id  — update (admin only)
// ─────────────────────────────────────────────────────────────────
router.put('/:id', requireAdmin, upload.single('image'), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ msg: 'Product not found' });

    const updateData = { ...req.body };
    if (req.file) {
      if (product.image && product.image.startsWith('/uploads/')) {
        const oldPath = path.join(__dirname, '../../public', product.image);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      updateData.image = `/uploads/products/${req.file.filename}`;
    }

    const updated = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(updated);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// ─────────────────────────────────────────────────────────────────
// DELETE /api/v1/products/:id  — delete (admin only)
// ─────────────────────────────────────────────────────────────────
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ msg: 'Product not found' });

    if (product.image && product.image.startsWith('/uploads/')) {
      const imgPath = path.join(__dirname, '../../public', product.image);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }
    await product.deleteOne();
    res.json({ msg: 'Product removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

module.exports = router;
