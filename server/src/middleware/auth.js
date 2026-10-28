const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'fallback-secret-for-development-32chars'
    );

    // Ensure token is an authentication token, not a reset token
    if (decoded.purpose && decoded.purpose === 'reset') {
      return res.status(401).json({ message: 'Invalid token type' });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'User belonging to this token no longer exists' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      message: err.name === 'TokenExpiredError' ? 'Token expired' : 'Not authorized, invalid token',
    });
  }
};

module.exports = { protect };

