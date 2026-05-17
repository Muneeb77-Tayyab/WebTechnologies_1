const express = require('express');
const router = express.Router();
const Product  = require('../../models/Product');
const Category = require('../../models/Category');
const multer   = require('multer');
const fs   = require('fs');
const path = require('path');

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
    if (allowed.test(path.extname(file.originalname).toLowerCase()) && allowed.test(file.mimetype)) {
      return cb(null, true);
    }
    cb(new Error('Images only!'));
  }
});

// List Products
router.get('/', async (req, res) => {
  try {
    const page  = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip  = (page - 1) * limit;
    const sortField = req.query.sort  || 'createdAt';
    const sortOrder = req.query.order === 'desc' ? -1 : 1;
    const sortOptions = { [sortField]: sortOrder };

    const totalProducts = await Product.countDocuments();
    const totalPages    = Math.ceil(totalProducts / limit);
    const products = await Product.find()
      .populate('category')
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);

    res.render('admin/products/index', {
      title: 'Manage Products',
      products, currentPage: page, totalPages,
      sortField, sortOrder: req.query.order || 'asc'
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// New Product Form
router.get('/new', async (req, res) => {
  try {
    const categories = await Category.find();
    res.render('admin/products/new', { title: 'New Product', categories });
  } catch (err) { res.status(500).send('Server Error'); }
});

// Create Product — Assignment 4: server-side validation
router.post('/', upload.single('image'), async (req, res) => {
  const { name, price, category, stock, rating } = req.body;

  // Server-side validation
  if (!name || !price || !category) {
    req.flash('error', 'Name, price, and category are required');
    return res.redirect('/admin/products/new');
  }
  if (isNaN(price) || Number(price) < 0) {
    req.flash('error', 'Price must be a valid positive number');
    return res.redirect('/admin/products/new');
  }

  try {
    const productData = { ...req.body };
    if (req.file) {
      productData.image = `/uploads/products/${req.file.filename}`;
    }
    await Product.create(productData);
    req.flash('success', 'Product created successfully');
    res.redirect('/admin/products');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Error creating product: ' + err.message);
    res.redirect('/admin/products/new');
  }
});

// Edit Product Form
router.get('/edit/:id', async (req, res) => {
  try {
    const product    = await Product.findById(req.params.id);
    const categories = await Category.find();
    if (!product) {
      req.flash('error', 'Product not found');
      return res.redirect('/admin/products');
    }
    res.render('admin/products/edit', { title: 'Edit Product', product, categories });
  } catch (err) { res.status(500).send('Server Error'); }
});

// Update Product
router.post('/edit/:id', upload.single('image'), async (req, res) => {
  const { name, price, category } = req.body;
  if (!name || !price || !category) {
    req.flash('error', 'Name, price, and category are required');
    return res.redirect(`/admin/products/edit/${req.params.id}`);
  }
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      req.flash('error', 'Product not found');
      return res.redirect('/admin/products');
    }
    const updateData = { ...req.body };
    if (req.file) {
      if (product.image && product.image.startsWith('/uploads/')) {
        const oldPath = path.join(__dirname, '../../public', product.image);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      updateData.image = `/uploads/products/${req.file.filename}`;
    }
    await Product.findByIdAndUpdate(req.params.id, updateData);
    req.flash('success', 'Product updated successfully');
    res.redirect('/admin/products');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Error updating product');
    res.redirect(`/admin/products/edit/${req.params.id}`);
  }
});

// Delete Product
router.post('/delete/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product && product.image && product.image.startsWith('/uploads/')) {
      const imgPath = path.join(__dirname, '../../public', product.image);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }
    await Product.findByIdAndDelete(req.params.id);
    req.flash('success', 'Product deleted successfully');
    res.redirect('/admin/products');
  } catch (err) {
    req.flash('error', 'Error deleting product');
    res.redirect('/admin/products');
  }
});

module.exports = router;
