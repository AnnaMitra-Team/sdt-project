const express = require('express');
const router = express.Router();
const volunteerController = require('../controllers/volunteer.controller');
const { isLoggedIn, isVolunteer } = require('../middlewares/auth.middleware');

// All routes here require user to be logged in and to be a volunteer
router.use(isLoggedIn, isVolunteer);

// Dashboard Route
router.get('/', volunteerController.renderDashboardPage);

// Assigned Tasks Route
router.get('/assigned-tasks', volunteerController.renderAssignedTasksPage);

// Donation History Route
router.get('/donation-history', volunteerController.renderDonationHistoryPage);

// Notifications Route
router.get('/notifications', volunteerController.renderNotificationsPage);

// NGOs Route
router.get('/ngos', volunteerController.renderNgosPage);

// Joined NGOs Route
router.get('/joined-ngos', volunteerController.renderJoinedNgosPage);

// Specific NGO Details Route
router.get('/ngos/:id', volunteerController.renderNgoDetailsPage);

// Manage Account Route
router.get('/account', volunteerController.renderManageAccountPage);


module.exports = router;