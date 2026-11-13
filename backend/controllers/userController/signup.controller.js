const { randomUUID } = require('crypto');
const { query } = require('../../database/connection');
const { passwordHash } = require('../../utils/bcryptHashing');
const customResponse = require('../../utils/customResponse');
const CustomError = require('../../utils/CustomError');

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function signup(req, res) {
  const firstName = req.body.firstName?.trim();
  const email = req.body.email?.trim().toLowerCase();
  const { password } = req.body;

  if (!firstName || !email || !password) {
    throw new CustomError('First name, email and password are required', 400);
  }
  if (!EMAIL_PATTERN.test(email)) {
    throw new CustomError('Enter a valid email address', 400);
  }
  if (password.length < 6) {
    throw new CustomError('Password must be at least 6 characters', 400);
  }

  const existing = await query('SELECT userId FROM users WHERE email = ?', [email]);
  if (existing.length) {
    throw new CustomError('An account with this email already exists', 409);
  }

  const userId = randomUUID();
  await query(
    'INSERT INTO users (userId, firstName, email, password) VALUES (?, ?, ?, ?)',
    [userId, firstName, email, await passwordHash(password)]
  );

  return customResponse(res, 201, 'Account created', { userId, firstName, email });
}

module.exports = signup;
