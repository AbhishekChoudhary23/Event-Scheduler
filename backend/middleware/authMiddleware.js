const jwt = require("jsonwebtoken");
const CustomError = require("../utils/CustomError");

// Middleware to authenticate JWT
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        throw new CustomError([{ message: "Unauthorized: No token provided" }], 401);
    }

    jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
        if (err) {
            throw new CustomError([{ message: "Forbidden: Invalid token" }], 403);
        }
        req.user = user;
        next();
    });
};

module.exports = authenticateToken;