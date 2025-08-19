const jwt = require('jsonwebtoken');

module.exports = (roles = []) => {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized', message: 'No token provided', code: 401 });
    }
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (roles.length && !roles.includes(decoded.role)) {
        return res.status(403).json({ error: 'Forbidden', message: 'Access denied', code: 403 });
      }
      req.user = decoded;
      next();
    } catch (err) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Invalid token', code: 401 });
    }
  };
};
