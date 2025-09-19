
const mongoos = require('mongoose');
const User = require('../models/user.model');
const NGOProfile = require('../models/ngoprofile.model');
const { ngoProfileSchema } = require('../utils/joiSchemas');
const Donation = require('../models/donation.model');
const safeRender = require('../utils/safeRender');
const catchAsync = require('../utils/catchAsync');


// Create NGO Profile
module.exports.createNgoProfile = async (userId, ngoProfile) => {
    ngoProfile.userId = userId;
    console.log('Creating NGO Profile:', ngoProfile);
    const newNgoProfile = new NGOProfile(ngoProfile);
    const createdNgoProfile = await newNgoProfile.save();
    return createdNgoProfile;
}

// Render Dashboard Page
module.exports.renderDashboardPage = catchAsync(async (req, res, next) => {
    console.log('Rendering NGO Dashboard for user:', req.user);
    safeRender(res, 'ngo/dashboard', {
        activePage: 'ngo-dashboard',
        pageTitle: 'NGO Dashboard | AnnaMitra',
        messageType: null,
        message: null
    }, next);
})

// Render Active Donations Page
module.exports.renderActiveDonationsPage = catchAsync(async (req, res, next) => {
    safeRender(res, 'ngo/active-donations', {
        activePage: 'ngo-active-donations',
        pageTitle: 'Active donations | AnnaMitra',
        messageType: null,
        message: null
    }, next);
})

// Render Staff Page
module.exports.renderStaffPage = catchAsync(async (req, res, next) => {
    safeRender(res, 'ngo/staff', {
        activePage: 'ngo-staff',
        pageTitle: 'Staff | AnnaMitra',
        messageType: null,
        message: null
    }, next);
})

// Render Joining Requests Page
module.exports.renderJoiningRequestsPage = catchAsync(async (req, res, next) => {
    safeRender(res, 'ngo/joining-requests', {
        activePage: 'ngo-joining-requests',
        pageTitle: 'Joining requests | AnnaMitra',
        messageType: null,
        message: null
    }, next);
})

// Render Notifications Page
module.exports.renderNotificationsPage = catchAsync(async (req, res, next) => {
    safeRender(res, 'ngo/notifications', {
        activePage: 'ngo-notifications',
        pageTitle: 'Notifications | AnnaMitra',
        messageType: null,
        message: null
    }, next);
})

// Render Manage Account Page
module.exports.renderManageAccountPage = catchAsync(async (req, res) => {
})

// Render Ngo Profile Page
module.exports.renderNgoProfilePage = catchAsync(async (req, res) => {
    res.send('NGO');
})

