const bcrypt = require('bcrypt');

// const saltRounds = 10;

// Hashing function
const passwordHash = (password) => {
    const hashedPassword = bcrypt.hash(password, parseInt(process.env.SALT_ROUNDS));
    return hashedPassword; // Return the hashed password
}

// Comparison function
const comparePassword = async(password, userPassword) => {
    const match = await bcrypt.compare(password, userPassword);
    return match; // Return true if passwords match, false otherwise
}

module.exports = { passwordHash, comparePassword }