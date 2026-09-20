const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Check if token exists in header
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey123');
    req.user = decoded; // Attach user info ({ id: user._id }) to the request
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};