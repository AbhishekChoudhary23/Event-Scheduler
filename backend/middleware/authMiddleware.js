const jwt = require('jsonwebtoken');
const CustomError = require('../utils/CustomError');

// Reads "Authorization: Bearer <token>" and puts the logged-in user on req.user.
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return next(new CustomError('Log in to continue', 401));
  }

  try {
    req.user = jwt.verify(token, process.env.SECRET_KEY);
    next();
  } catch {
    next(new CustomError('Session expired. Log in again', 401));
  }
};

module.exports = authenticateToken;
