const express = require('express');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();
const donationController = require('../controllers/donation.controller');
const donationMiddleware = require('../middlewares/donation.middleware');
const { isLoggedIn, isDonor } = require('../middlewares/auth.middleware');

// All routes here require user to be logged in and to be a donor
// router.use(isLoggedIn, isDonor);

// Multer setup for file uploads
const storage = multer.diskStorage({
    destination: 'public/images/donations',
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + uuidv4() + '.' + file.originalname.split('.').pop());
    }
});
const upload = multer({ storage });


router.get('/new', donationController.renderDonationForm);

router.post('/', upload.any(), donationMiddleware.validateDonationData, donationController.submitDonationForm);

router.get('/', donationController.listDonations);

router.get('/:id', donationController.viewDonationDetails);

router.get('/:id/edit', donationController.renderEditDonationForm);

router.put('/:id/', upload.any(), donationMiddleware.validateDonationData, donationController.submitEditDonationForm);

router.delete('/:id', donationController.deleteDonation);

router.post('/:id/requests', donationController.handleDonationRequest);

router.post('/:id/requests/:requestId/approve', donationController.approveRequest);

router.post('/:id/requests/:requestId/reject', donationController.rejectRequest);

router.post('/:id/cancel-pickup', donationController.cancelDonationPickup);

// OTP routes
router.post('/:id/send-otp', donationController.sendOTP);
router.post('/:id/verify-otp', donationController.verifyOTP);


module.exports = router;