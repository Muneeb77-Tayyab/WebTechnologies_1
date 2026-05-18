const express = require('express');
const router = express.Router();
const Product  = require('../../models/Product');
const Category = require('../../models/Category');

// ─────────────────────────────────────────────────────────
// GET /shop & /products — Assignment 3: pagination + search + filter
// Query: ?q= ?category= ?minPrice= ?maxPrice= ?page=
// ─────────────────────────────────────────────────────────
router.get(['/shop', '/products'], async (req, res) => {
  try {
    const page  = parseInt(req.query.page) || 1;
    const limit = 8;   // Assignment 3 requires 8 per page
    const skip  = (page - 1) * limit;

    const query = {};

    // Search by name
    if (req.query.q) {
      query.name = { $regex: req.query.q, $options: 'i' };
    }

    // Price range filter
    if (req.query.minPrice || req.query.maxPrice) {
      query.price = {};
      if (req.query.minPrice) query.price.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) query.price.$lte = Number(req.query.maxPrice);
    }

    // Category filter via slug
    let selectedCategory = null;
    if (req.query.category) {
      selectedCategory = await Category.findOne({ slug: req.query.category });
      if (selectedCategory) query.category = selectedCategory._id;
    }

    const totalProducts = await Product.countDocuments(query);
    const totalPages    = Math.ceil(totalProducts / limit);
    const products      = await Product.find(query)
      .populate('category')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.render('shop/index', {
      title: selectedCategory ? `Category: ${selectedCategory.name}` : 'Our Shop',
      products,
      currentPage: page,
      totalPages,
      searchQuery:      req.query.q        || '',
      minPrice:         req.query.minPrice  || '',
      maxPrice:         req.query.maxPrice  || '',
      selectedCategory: req.query.category  || ''
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// GET /onsale-products
router.get('/onsale-products', async (req, res) => {
  try {
    const products = await Product.find({ isOnSale: true }).populate('category').sort({ createdAt: -1 });
    res.render('shop/onsale', { title: 'On-Sale Products', products });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Category page (kept for direct category links)
router.get('/shop/category/:slug', async (req, res) => {
  res.redirect(`/shop?category=${req.params.slug}`);
});

// Product details
router.get('/product/:slug', async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug }).populate('category');
    if (!product) {
      return res.status(404).render('index', {
        title: 'Product Not Found',
        description: 'The product you are looking for does not exist.'
      });
    }
    res.render('shop/product', { title: product.name, product });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
