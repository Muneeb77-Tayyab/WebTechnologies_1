require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const expressLayouts = require('express-ejs-layouts');
const path = require('path');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const morgan = require('morgan');
const cors = require('cors');

// Middlewares
const globalMiddleware = require('./middlewares/global');

// Route imports
const indexRoutes = require('./routes/index');
const shopRoutes = require('./routes/shop/index');
const authRoutes = require('./routes/auth/index');
const cartRoutes = require('./routes/shop/cart');
const checkoutRoutes = require('./routes/shop/checkout');
const adminIndexRoutes = require('./routes/admin/index');
const adminProductRoutes = require('./routes/admin/products');
const adminCategoryRoutes = require('./routes/admin/categories');
const adminOrderRoutes = require('./routes/admin/orders');
const { ensureAdmin } = require('./middlewares/auth');

// API v1 Route imports
const apiAuthRoutes = require('./routes/api/auth');
const apiProductRoutes = require('./routes/api/products');
const apiCategoryRoutes = require('./routes/api/categories');
const apiOrderRoutes = require('./routes/api/orders');
const apiUserRoutes = require('./routes/api/user');
const apiStatsRoutes = require('./routes/api/stats');

const app = express();

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/improved-ecommerce';

// Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// CORS — allow frontend dev server to send credentials
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));

// HTTP request logger (dev only)
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// EJS & Layouts
app.use(expressLayouts);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'layout');

// Built-in Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());

// Session with MongoDB persistent store
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-secret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: MONGO_URI }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 24  // 24 hours
  }
}));

// connect-flash (must be after session)
app.use(flash());

// Global Middleware (categories, cart count, flash vars, user)
app.use(globalMiddleware);

// Set admin layout for all /admin routes
app.use('/admin', (req, res, next) => {
  res.locals.layout = 'admin-layout';
  next();
});

// ─── EJS / SSR Routes ──────────────────────────────────
app.use('/', indexRoutes);
app.use('/auth', authRoutes);
app.use('/cart', cartRoutes);
app.use('/checkout', checkoutRoutes);
app.use('/', shopRoutes);

// Admin Routes (protected)
app.use('/admin', ensureAdmin, adminIndexRoutes);
app.use('/admin/products', ensureAdmin, adminProductRoutes);
app.use('/admin/categories', ensureAdmin, adminCategoryRoutes);
app.use('/admin/orders', ensureAdmin, adminOrderRoutes);

// ─── REST API v1 Routes ─────────────────────────────────
app.use('/api/v1/auth', apiAuthRoutes);
app.use('/api/v1/products', apiProductRoutes);
app.use('/api/v1/categories', apiCategoryRoutes);
app.use('/api/v1/orders', apiOrderRoutes);
app.use('/api/v1/user', apiUserRoutes);
app.use('/api/v1/stats', apiStatsRoutes);

// ─── 404 Handler ───────────────────────────────────────
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ msg: 'Route not found' });
  }
  res.status(404).render('index', {
    title: '404 - Page Not Found',
    description: 'The page you are looking for does not exist.'
  });
});

// ─── Global Error Handler ──────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  const status = err.status || 500;
  if (req.path.startsWith('/api/')) {
    return res.status(status).json({ msg: err.message || 'Server Error' });
  }
  res.status(status).send(err.message || 'Server Error');
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📦 API available at http://localhost:${PORT}/api/v1`);
});
