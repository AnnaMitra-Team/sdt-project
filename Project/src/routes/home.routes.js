const express = require('express');
const router = express.Router();
const homeController = require('../controllers/home.controller');

// Route for the home page
router.get('/', homeController.renderHomePage);

// Route for the about page
router.get('/about', homeController.renderAboutPage);

// Route for the contact page
router.get('/contact', homeController.renderContactPage);

// Route for testing purpose
router.get('/test', homeController.testRoute);


module.exports = router;