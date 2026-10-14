const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'bbdms_secret_key_2026';

// Middleware to authenticate JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication token required. Please log in.'
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Invalid or expired session token. Please log in again.'
      });
    }

    req.user = user; // { id, donor_id, role, email }
    next();
  });
};

// Middleware to restrict routes to specific roles (e.g. ['admin', 'staff'])
const requireRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized. Please log in.'
      });
    }

    const userRole = (req.user.role || '').toLowerCase();
    const isAllowed = allowedRoles.some(r => r.toLowerCase() === userRole);

    if (!isAllowed) {
      return res.status(403).json({
        success: false,
        message: `Access denied: This module is restricted to ${allowedRoles.join(' / ')} accounts only. (Your role: ${req.user.role})`
      });
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  requireRoles
};
