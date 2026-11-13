const bcrypt = require('bcrypt');

const saltRounds = Number(process.env.SALT_ROUNDS) || 10;

const passwordHash = (password) => bcrypt.hash(password, saltRounds);

const comparePassword = (password, hashedPassword) => bcrypt.compare(password, hashedPassword);

module.exports = { passwordHash, comparePassword };
