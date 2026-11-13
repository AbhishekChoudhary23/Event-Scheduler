const { query } = require('../../database/connection');
const { comparePassword } = require('../../utils/bcryptHashing');
const generateToken = require('../../service/generateToken');
const customResponse = require('../../utils/customResponse');
const CustomError = require('../../utils/CustomError');

async function login(req, res) {
  const email = req.body.email?.trim().toLowerCase();
  const { password } = req.body;

  if (!email || !password) {
    throw new CustomError('Email and password are required', 400);
  }

  const [found] = await query(
    'SELECT userId, firstName, email, password FROM users WHERE email = ? AND isArchived = FALSE',
    [email]
  );

  // Same message for "no such user" and "wrong password" so emails can't be guessed.
  if (!found || !(await comparePassword(password, found.password))) {
    throw new CustomError('Wrong email or password', 401);
  }

  const user = { userId: found.userId, firstName: found.firstName, email: found.email };
  return customResponse(res, 200, 'Logged in', { user, token: generateToken(user) });
}

module.exports = login;
