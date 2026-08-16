const jwt = require('jsonwebtoken');

const generateToken = (user) => {
    const payload = {
        email: user.email,
        userid: user.userid,
        fistname: user.firstname
    };

    const token = jwt.sign(payload, process.env.SECRET_KEY, {
        expiresIn: process.env.EXPIRATION_TIME
    });

    return token;
};

module.exports = generateToken;