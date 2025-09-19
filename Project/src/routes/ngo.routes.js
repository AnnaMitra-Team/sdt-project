const express = require('express');
const router = express.Router();
const ngoController = require('../controllers/ngo.controller');
const { isLoggedIn, isNGO } = require('../middlewares/auth.middleware');

// All routes here require user to be logged in and to be a ngo
router.use(isLoggedIn, isNGO);

// Dashboard Route
router.get('/', ngoController.renderDashboardPage);

// Active Donations Route
router.get('/active-donations', ngoController.renderActiveDonationsPage);

// Staff Route
router.get('/staff', ngoController.renderStaffPage);

// Joining Requests Route
router.get('/joining-requests', ngoController.renderJoiningRequestsPage);

// Notifications Route
router.get('/notifications', ngoController.renderNotificationsPage);

// Manage Account Route
router.get('/account', ngoController.renderManageAccountPage);

// View Ngo Profile Route
router.get('/:id', ngoController.renderNgoProfilePage);

module.exports = router;