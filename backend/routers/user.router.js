const express = require("express");
const router = express.Router();

const signup = require('../controllers/userController/signup.controller')
const login = require('../controllers/userController/login.controller')


router.post("/login", login); // login route
router.post("/signup", signup); // signup route

module.exports = router;