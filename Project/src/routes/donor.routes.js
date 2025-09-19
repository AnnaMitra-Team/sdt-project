const express = require('express');
const router = express.Router();
const donorController = require('../controllers/donor.controller');
const { isLoggedIn, isDonor } = require('../middlewares/auth.middleware');

// All routes here require user to be logged in and to be a donor
router.use(isLoggedIn, isDonor);

module.exports = router;