const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const signup = require('../controllers/userController/signup.controller');
const login = require('../controllers/userController/login.controller');

const router = express.Router();

router.post('/signup', asyncHandler(signup));
router.post('/login', asyncHandler(login));

module.exports = router;
