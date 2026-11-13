const jwt = require('jsonwebtoken');

const generateToken = ({ userId, email, firstName }) =>
  jwt.sign({ userId, email, firstName }, process.env.SECRET_KEY, {
    expiresIn: process.env.EXPIRATION_TIME || '1h',
  });

module.exports = generateToken;
