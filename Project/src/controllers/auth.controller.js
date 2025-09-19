
// -------------------------  Imports  -------------------------
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const passport = require('passport');

const User = require('../models/user.model');
const Donation = require('../models/donation.model');
const DonationRequest = require('../models/donationrequest.model');

const donorController = require('./donor.controller');
const ngoController = require('./ngo.controller');
const volunteerController = require('./volunteer.controller');

const safeRender = require('../utils/safeRender');
const catchAsync = require('../utils/catchAsync');



// Render login page
module.exports.renderLoginPage = (req, res, next) => {
    if (req.session) {
        console.log('Session data:', req.session);
    }
    return safeRender(res, 'login', {
        activePage: 'login',
        pageTitle: 'Login now | AnnaMitra',
        messageType: null,
        message: null
    }, next);
}

// Render register page
module.exports.renderRegisterPage = (req, res, next) => {
    return safeRender(res, 'register', {
        activePage: 'register',
        pageTitle: 'Register now | AnnaMitra',
        formData: {},
        messageType: null,
        message: null
    }, next);
}

// Render forgot password page
module.exports.renderForgotPasswordPage = (req, res, next) => {
    return safeRender(res, 'forgot-password', {
        activePage: 'forgot-password',
        pageTitle: 'Forgot password | AnnaMitra',
        messageType: null,
        message: null
    }, next);
}

// Handle user login
module.exports.loginUser = (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
        if (err) return next(err);

        if (!user) {
            // Authentication failed
            // `info.message` comes from passport-local (e.g. "Missing credentials", "Incorrect password")
            return res.status(400).json({ success: false, message: info.message || "Login failed" });
        }

        // Log the user in
        req.login(user, (err) => {
            if (err) {
                console.log(err);
                return next(err);
            }

            // 🔑 Custom role-based redirect logic
            console.log('User logged in:', user);
            return res.status(200).json({ success: true, message: "Login successful!", role: user.role.toLowerCase() });
        });
    })(req, res, next);
}

// Handle user registration
// module.exports.registerUser = catchAsync(async (req, res) => {

//     const {
//         'first-name': firstName,
//         'last-name': lastName,
//         email,
//         contact,
//         'account-type': accountType,
//         address,
//         password
//     } = req.body;

//     const formData = {
//         firstName,
//         lastName,
//         email,
//         contact,
//         accountType,
//         address
//     };

//     if (!firstName || !lastName || !email || !accountType || !password) {
//         return safeRender(res, 'register', {
//             activePage: 'register',
//             pageTitle: 'Register now | AnnaMitra',
//             formData,
//             messageType: 'danger',
//             message: "All required fields must be filled."
//         }, next);
//     }

//     if(mongoose.connection.readyState !== 1) {
//         console.error('Database connection is not ready');
//         return safeRender(res, 'register', {
//             activePage: 'register',
//             pageTitle: 'Register now | AnnaMitra',
//             formData,
//             messageType: 'danger',
//             message: "Database connection error. Please try again later."
//         }, next);
//     }

//     console.log('POST register', formData);
//     try {
//         const existingUser = await User.findOne({ email });
//         if (existingUser) {
//             return safeRender(res, 'register', {
//                 activePage: 'register',
//                 pageTitle: 'Register now | AnnaMitra',
//                 formData,
//                 messageType: 'danger',
//                 errorMessage: "Email already registered."
//             }, next);
//         }

//         const salt = await bcrypt.genSalt(10);
//         const passwordHash = await bcrypt.hash(password, salt);
//         const user = new User({
//             firstName,
//             lastName,
//             email,
//             contact,
//             role: accountType,
//             address,
//             passwordHash
//         });
//         await user.save();
//         console.log('User registered successfully');
//         res.redirect('/auth/login');
//     } catch (error) {
//         console.error('Error registering user:', error.message);
//         safeRender(res, 'register', {
//             activePage: 'register',
//             pageTitle: 'Register now | AnnaMitra',
//             formData,
//             messageType: 'danger',
//             errorMessage : error.message
//         }, next);
//     }
// })

module.exports.registerUser = async (req, res, next) => {
    try {
        const { user } = req.body;
        // register the user and if successful, create profile based on role
        const registeredUser = await User.register(user, user.password)
        console.log('User registered:', registeredUser);
        if (user.role === 'Donor') {
            donorController.createDonorProfile(registeredUser._id, req.body.donorProfile);
        } else if (user.role === 'NGO') {
            ngoController.createNgoProfile(registeredUser._id, req.body.ngoProfile);
        } else if (user.role === 'Volunteer') {
            volunteerController.createVolunteerProfile(registeredUser._id, req.body.volunteerProfile);
        }
        req.login(registeredUser, err => {
            if (err) {
                console.log(err);
                next(err);
            }
            return res.status(200).json({ success: true, message: 'Registration successful!', role: registeredUser.role.toLowerCase() });
        });
    } catch (error) {
        console.log(error);
        res.status(400).json({ success: false, message: error.message });
    }
}

// Handle logout
module.exports.logoutUser = (req, res) => {
    res.redirect('/');
}



