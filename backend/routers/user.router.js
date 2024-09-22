
const express = require("express");
const router = express.Router();

// const authenticateToken = require("../middleware/authMiddleware");

const signup = require('../controllers/userController/signup.controller')
const login = require('../controllers/userController/login.controller')


router.post("/login", login); // login route
router.post("/signup", signup); // signup route
// router.get("/getme", authenticateToken, getMe); // getMe route
// router.get("/:user_id", getUserByUserId);

module.exports = router;