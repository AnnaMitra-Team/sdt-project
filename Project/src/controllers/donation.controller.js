
const e = require('express');
const fs = require('fs');
const Donation = require('../models/donation.model');
const DonationRequest = require('../models/donationrequest.model');
const userController = require('./user.controller');
const mongoose = require('mongoose');
const safeRender = require('../utils/safeRender');
const catchAsync = require('../utils/catchAsync');

const { deleteFiles } = require('../helpers/donation.helpers'); // Import the new helpers


// Render the donation form
module.exports.renderDonationForm = (req, res, next) => {
    return safeRender(res, 'donations/new', {
        activePage: 'donate',
        pageTitle: 'Donate food | AnnaMitra',
        messageType: null,
        message: null
    }, next);
}

// Handle the donation form submission
module.exports.submitDonationForm = catchAsync(async (req, res, next) => {

    if (mongoose.connection.readyState !== 1) {
        console.error('Database connection is not ready');
        return res.json({ success: false, message: 'Database connection error! Faild to upload donation.' });
    }

    try {
        console.log('-----------------------------------------');
        // console.log('Donation:', req.donation);

        const donation = new Donation(req.donation);
        await donation.save();

        return res.status(201).json({
            success: true,
            message: 'Donation created successfully.',
            donationId: donation._id
        });
    } catch (error) {
        console.error('Error creating donation:', error);
        return res.status(500).json({ success: false, message: 'Server error while saving donation.' });
    }
})

// View donation details
module.exports.viewDonationDetails = catchAsync(async (req, res, next) => {
    const donationId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(donationId)) {
        res.status(400);
        return safeRender(res, 'donations/show', {
            activePage: 'donation-details',
            pageTitle: 'Donation not found | AnnaMitra',
            messageType: 'danger',
            message: 'Invalid donation ID!'
        }, next);
    }

    try {
        const donation = await Donation.findById(donationId).populate('donorId', 'firstName lastName email contact');
        if (!donation) {
            res.status(404);
            return safeRender(res, 'donations/show', {
                activePage: 'donation-details',
                pageTitle: 'Donation not found | AnnaMitra',
                messageType: 'danger',
                message: 'Donation not found!'
            }, next);
        }

        const ngoId = await userController.findOneUserId('NGO');

        // Fetch donation requests for this donation with status 'New'
        const DonationRequest = require('../models/donationrequest.model');
        const donationRequests = await DonationRequest.find({ 
            donationId: donationId, 
            status: 'New' 
        }).populate('ngoId', 'firstName lastName email contact');

        return safeRender(res, 'donations/show', {
            activePage: 'donate',
            pageTitle: `${donation.title} | AnnaMitra`,
            messageType: null,
            message: null,
            ngoId,
            donation,
            donationRequests
        }, next);
    } catch (error) {
        console.error('Error fetching donation details:', error);
        res.status(500);
        return safeRender(res, 'donations/show', {
            activePage: 'donation-details',
            pageTitle: 'Error | AnnaMitra',
            messageType: 'danger',
            message: 'Server error while fetching donation details.'
        }, next);
    }
})

// Render edit donation form
module.exports.renderEditDonationForm = catchAsync(async (req, res, next) => {
    const donationId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(donationId)) {
        res.status(400);
        return safeRender(res, 'donations/edit', {
            activePage: 'edit-donation',
            pageTitle: 'Donation not found | AnnaMitra',
            messageType: 'danger',
            message: 'Invalid donation ID.'
        }, next);
    }

    try {
        const donation = await Donation.findById(donationId).populate('donorId', 'firstName lastName email contact');
        if (!donation) {
            res.status(404);
            return safeRender(res, 'donations/edit', {
                activePage: 'edit-donation',
                pageTitle: 'Donation not found | AnnaMitra',
                messageType: 'danger',
                message: 'Donation not found.'
            }, next);
        }

        console.log('Donation found for edit:', donation);
        return safeRender(res, 'donations/edit', {
            activePage: 'edit-donation',
            pageTitle:'Edit donation | AnnaMitra', 
            messageType: null,
            message: null,
            donation
        }, next);
    } catch (error) {
        console.error('Error fetching donation for edit:', error);
        res.status(500);
        return safeRender(res, 'donations/edit', {
            activePage: 'edit-donation',
            pageTitle: 'Error | AnnaMitra',
            messageType: 'danger',
            message: 'Server error while fetching donation for edit.'
        }, next);
    }
})

module.exports.submitEditDonationForm = catchAsync(async (req, res) => {
    // return res.status(400).json({success: false, message: 'failll'});

    if (mongoose.connection.readyState !== 1) {
        console.error('Database connection is not ready');
        return res.json({ success: false, message: 'Database connection error! Faild to upload donation.' });
    }

    try {
        const { donation, oldImages } = req;
        const donationId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(donationId)) {
            return res.status(400).json({ success: false, message: 'Invalid donation ID.' });
        }

        const newDonation = await Donation.findByIdAndUpdate(donationId, donation, { new: true });

        if (!newDonation) {
            return res.status(404).json({ success: false, message: 'Donation not found! Failed to update.' });
        }

        deleteFiles(oldImages);

        return res.status(200).json({
            success: true,
            message: 'Donation updated successfully.',
            donationId: newDonation._id
        });
    } catch (error) {
        console.error('Error updating donation:', error);
        return res.status(500).json({ success: false, message: 'Server error while updating donation.' });
    }
});

// Delete a donation
module.exports.deleteDonation = catchAsync(async (req, res) => {
    const donationId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(donationId)) {
        return res.status(400).json({ success: false, message: 'Invalid donation ID.' });
    }

    if (mongoose.connection.readyState !== 1) {
        console.error('Database connection is not ready');
        return res.json({ success: false, message: 'Database connection error! Faild to upload donation.' });
    }

    try {
        const donation = await Donation.findByIdAndDelete(donationId);
        if (!donation) {
            return res.status(404).json({ success: false, message: 'Donation not found.' });
        }

        return res.status(200).json({ success: true, message: 'Donation deleted successfully.' });
    } catch (error) {
        console.error('Error deleting donation:', error);
        return res.status(500).json({ success: false, message: 'Server error while deleting donation.' });
    }
})

// List all donations
module.exports.listDonations = catchAsync(async (req, res, next) => {
    try {
        if(!mongoose.connection.readyState) {
            console.error('Database connection is not ready');
            res.status(500);
            return safeRender(res, 'donations/index', {
                activePage: 'donations',
                pageTitle: 'Connection error | AnnaMitra',
                messageType: 'danger',
                message: 'Database connection error! Failed to fetch donations.',
                donations: [],
            }, next);
        }

        const donations = await Donation.find().populate('donorId', 'firstName lastName email contact').sort({ createdAt: -1 });
        return safeRender(res, 'donations/index', {
            activePage: 'donations',
            pageTitle: `${donations.length} - Donations found | AnnaMitra`,
            messageType: null,
            message: null,
            donations
        }, next);
    } catch (error) {
        console.error('Error fetching donations:', error);
        res.status(500);
        return safeRender(res, 'donations/index', {
            activePage: 'donations',
            pageTitle: 'Error | AnnaMitra',
            messageType: 'danger',
            message: 'Server error while fetching donations.',
            donations: []
        }, next);
    }
})



// Add to src/controllers/donation.controller.js

// Handle donation request
module.exports.handleDonationRequest = catchAsync(async (req, res) => {
    const { donationId, donorId, ngoId, message } = req.body;
    
    try {
        // Check if a request from this ngoId for this donationId already exists
        const existingRequest = await DonationRequest.findOne({ donationId, ngoId });
        if (existingRequest) {
            return res.json({ success: false, message: 'You have already requested this donation.' });
        }
        const request = new DonationRequest({
            donationId,
            donorId,
            ngoId,
            message
        });
        
        await request.save();
        res.json({ success: true, message: 'Request sent successfully' });
    } catch (error) {
        if (error.code === 11000) {
            return res.json({ success: false, message: "You have already requested this donation." });
        }
        console.log(error.message);
        res.status(500).json({ success: false, message: 'Failed to send request' });
    }
});

// Approve donation request
module.exports.approveRequest = catchAsync(async (req, res) => {
    const { requestId } = req.params;
    
    try {
        const request = await DonationRequest.findByIdAndUpdate(requestId, {
            status: 'Accepted',
            respondedAt: new Date()
        });
        
        // Update donation status to 'Assigned'
        await Donation.findByIdAndUpdate(request.donationId, { status: 'Assigned', assignedNgoId: request.ngoId });
        
        res.json({ success: true, message: 'Request approved' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to approve request' });
    }
});

// Reject donation request
module.exports.rejectRequest = catchAsync(async (req, res) => {
    const { requestId } = req.params;
    
    try {
        await DonationRequest.findByIdAndUpdate(requestId, {
            status: 'Rejected',
            respondedAt: new Date()
        });
        
        res.json({ success: true, message: 'Request rejected' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to reject request' });
    }
});

// Cancel Donation Pickup
module.exports.cancelDonationPickup = catchAsync(async (req, res) => {
    const { id } = req.params; // donation ID
    
    try {
        // Find the donation and check if it's assigned
        const donation = await Donation.findById(id);
        if (!donation) {
            return res.status(404).json({ success: false, message: 'Donation not found' });
        }
        
        if (donation.status !== 'Assigned') {
            return res.status(400).json({ success: false, message: 'Donation is not currently assigned' });
        }
        
        if (!donation.assignedNgoId) {
            return res.status(400).json({ success: false, message: 'No NGO is currently assigned to this donation' });
        }
        
        // Mark the donation request from the assigned NGO as rejected
        const DonationRequest = require('../models/donationrequest.model');
        await DonationRequest.findOneAndUpdate(
            { 
                donationId: id, 
                ngoId: donation.assignedNgoId,
                status: 'Accepted'
            },
            { 
                status: 'Rejected',
                respondedAt: new Date()
            }
        );
        
        // Reset the donation status to 'New' and remove assigned NGO
        await Donation.findByIdAndUpdate(id, {
            status: 'New',
            assignedNgoId: null
        });
        
        res.json({ 
            success: true, 
            message: 'Donation pickup cancelled successfully. The donation is now available for other NGOs.' 
        });
        
    } catch (error) {
        console.error('Error cancelling donation pickup:', error);
        res.status(500).json({ success: false, message: 'Failed to cancel donation pickup' });
    }
});

// Generate and send OTP to donor
module.exports.sendOTP = catchAsync(async (req, res) => {
    const { id } = req.params; // donation ID
    
    try {
        // Find the donation and check if it's assigned
        const donation = await Donation.findById(id).populate('donorId');
        if (!donation) {
            return res.status(404).json({ success: false, message: 'Donation not found' });
        }
        
        if (donation.status !== 'Assigned') {
            return res.status(400).json({ success: false, message: 'Donation is not currently assigned' });
        }
        
        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Store OTP in donation document (you might want to create a separate OTP model)
        await Donation.findByIdAndUpdate(id, { 
            otp: otp,
            otpExpiry: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes expiry
            otpGeneratedAt: new Date()
        });
        
        // In a real application, you would send SMS here
        // For now, we'll just log it and return success
        console.log(`OTP ${otp} sent to donor ${donation.donorId.contact} for donation ${id}`);
        
        // TODO: Integrate with SMS service (Twilio, etc.)
        // await sendSMS(donation.donorId.contact, `Your OTP for donation pickup is: ${otp}`);
        
        res.json({ 
            success: true, 
            message: 'OTP sent successfully to donor',
            otp: otp // Remove this in production - only for testing
        });
        
    } catch (error) {
        console.error('Error sending OTP:', error);
        res.status(500).json({ success: false, message: 'Failed to send OTP' });
    }
});

// Verify OTP and mark donation as picked
module.exports.verifyOTP = catchAsync(async (req, res) => {
    const { id } = req.params; // donation ID
    const { otp } = req.body;
    
    try {
        // Find the donation
        const donation = await Donation.findById(id);
        if (!donation) {
            return res.status(404).json({ success: false, message: 'Donation not found' });
        }
        
        if (donation.status !== 'Assigned') {
            return res.status(400).json({ success: false, message: 'Donation is not currently assigned' });
        }
        
        // Check if OTP exists and is valid
        if (!donation.otp || !donation.otpExpiry) {
            return res.status(400).json({ success: false, message: 'No OTP found for this donation' });
        }
        
        // Check if OTP has expired
        if (new Date() > donation.otpExpiry) {
            return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
        }
        
        // Verify OTP
        if (donation.otp !== otp) {
            return res.status(400).json({ success: false, message: 'Invalid OTP. Please try again.' });
        }
        
        // Update donation status to 'Picked'
        await Donation.findByIdAndUpdate(id, {
            status: 'Picked',
            pickedAt: new Date(),
            otp: null, // Clear OTP after successful verification
            otpExpiry: null,
            otpGeneratedAt: null
        });
        
        // Update the donation request status to 'Completed'
        const DonationRequest = require('../models/donationrequest.model');
        await DonationRequest.findOneAndUpdate(
            { 
                donationId: id, 
                ngoId: donation.assignedNgoId,
                status: 'Accepted'
            },
            { 
                status: 'Completed',
                completedAt: new Date()
            }
        );
        
        res.json({ 
            success: true, 
            message: 'OTP verified successfully! Donation marked as picked up.' 
        });
        
    } catch (error) {
        console.error('Error verifying OTP:', error);
        res.status(500).json({ success: false, message: 'Failed to verify OTP' });
    }
});

