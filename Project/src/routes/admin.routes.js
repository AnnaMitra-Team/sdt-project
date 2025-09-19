const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { isLoggedIn, isAdmin } = require('../middlewares/auth.middleware');

// Check if user is admin for all admin routes
router.use(isLoggedIn, isAdmin);

module.exports = router;