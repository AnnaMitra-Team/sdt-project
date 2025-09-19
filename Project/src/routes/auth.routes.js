const express = require('express');
const router = express.Router();
const passport = require('passport');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth.middleware');

const storage = multer.diskStorage({
    destination: 'public/documents/ngos',
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + uuidv4() + '.' + file.originalname.split('.').pop());
    }
});
const upload = multer({ storage });


// Route for logout
router.get('/logout', authMiddleware.isLoggedIn, authController.logoutUser);

router.use(authMiddleware.isLoggedOut);

// Route for the login page
router.get('/login', authController.renderLoginPage);

// Handle login form submission
router.post('/login', passport.authenticate('local', { failureRedirect: '/auth/login', failureMessage: true }), authController.loginUser);

// Route for the register page
router.get('/register', authController.renderRegisterPage);

// Handle register form submission
router.post('/register', upload.any(), authMiddleware.validateRegistrationData, authController.registerUser);

// Route for the forgot password page
router.get('/forgot-password', authController.renderForgotPasswordPage);


module.exports = router;