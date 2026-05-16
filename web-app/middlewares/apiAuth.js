const jwt = require('jsonwebtoken');

/**
 * requireAuth — allows any authenticated user (valid JWT)
 * Used for: POST /api/v1/orders, GET /api/v1/user/profile
 */
const requireAuth = function (req, res, next) {
  const token =
    req.header('x-auth-token') ||
    (req.header('Authorization') || '').replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

/**
 * requireAdmin — only allows admin-role users (valid JWT + role === 'admin')
 * Used for: product/category CRUD, order management, stats
 */
const requireAdmin = function (req, res, next) {
  const token =
    req.header('x-auth-token') ||
    (req.header('Authorization') || '').replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied: Admin only' });
    }
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

module.exports = { requireAuth, requireAdmin };
