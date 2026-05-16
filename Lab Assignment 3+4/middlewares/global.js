const Category = require('../models/Category');

module.exports = async (req, res, next) => {
  // ── connect-flash messages ──
  res.locals.success_msg = req.flash('success');
  res.locals.error_msg   = req.flash('error');

  // ── Current logged-in user ──
  res.locals.user = req.session.user || null;

  // ── Load categories for nav dropdown ──
  try {
    const categories = await Category.find().sort('name');
    res.locals.categories = categories;
  } catch (err) {
    res.locals.categories = [];
  }

  // ── Cart item count from cookie ──
  try {
    const cart = req.cookies.cart ? JSON.parse(req.cookies.cart) : [];
    res.locals.cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  } catch (err) {
    res.locals.cartCount = 0;
  }

  next();
};
