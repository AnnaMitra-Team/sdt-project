const { expect } = require('chai');
const sinon = require('sinon');
const fs = require('fs');
const mongoose = require('mongoose');

// Import the modules we need to test and mock
const donationController = require('../controllers/donation.controller'); // Adjust path
const Donation = require('../models/donation.model'); // Adjust path

describe('submitEditDonationForm Integration Test', () => {
    let req, res, next;

    // Before each test, reset our mocks and spies
    beforeEach(() => {
        // Mock the request object
        req = {
            body: {},
            files: [],
        };

        // Mock the response object with Sinon spies to track calls
        res = {
            status: sinon.stub().returnsThis(), // Allows chaining e.g., res.status(200).json(...)
            json: sinon.spy(),
        };

        // Mock the next function
        next = sinon.spy();
        
        // Stub the external dependencies (database and filesystem)
        sinon.stub(Donation, 'findByIdAndUpdate');
        sinon.stub(fs, 'existsSync');
        sinon.stub(fs, 'unlinkSync');
    });

    // After each test, restore all mocked functions to their original state
    afterEach(() => {
        sinon.restore();
    });

    // --- Test Case 1: The Happy Path (Successful update with new images) ---
    it('should update a donation and delete old images when new ones are uploaded', async () => {
        // Arrange: Set up the mock request body and files
        req.body = {
            donationId: new mongoose.Types.ObjectId().toString(),
            title: 'Updated Community Feast',
            oldDonationImages: ['/uploads/old_donation.jpg'],
            foodItems: [
                { name: 'Rice', quantity: '10', oldItemImages: ['/uploads/old_rice.jpg'] }
            ]
            // ... other necessary form fields
        };
        req.files = [
            { fieldname: 'images[0]', path: 'public/uploads/new_donation.jpg' }
        ];

        // Arrange: Configure mock behavior
        fs.existsSync.returns(true); // Pretend all old image files exist
        Donation.findByIdAndUpdate.resolves({ _id: req.body.donationId }); // Simulate successful DB update

        // Act: Call the controller function
        await donationController.submitEditDonationForm(req, res, next);
        
        // Assert: Check the results
        // 1. Verify that old images were deleted
        expect(fs.unlinkSync.calledWith('public/uploads/old_donation.jpg')).to.be.true;
        expect(fs.unlinkSync.calledWith('public/uploads/old_rice.jpg')).to.be.true;

        // 2. Verify the database was updated with the correct data
        const dbUpdateCall = Donation.findByIdAndUpdate.getCall(0);
        const updatedData = dbUpdateCall.args[1];
        expect(updatedData.images[0]).to.include('/uploads/new_donation.jpg');
        expect(updatedData.items[0].name).to.equal('Rice');
        
        // 3. Verify the correct HTTP response was sent
        expect(res.status.calledWith(200)).to.be.true;
        expect(res.json.calledWithMatch({ success: true, message: /updated successfully/ })).to.be.true;
    });

    // --- Test Case 2: Successful update WITHOUT new images ---
    it('should update a donation but keep old images if no new ones are uploaded', async () => {
        // Arrange
        req.body = {
            donationId: new mongoose.Types.ObjectId().toString(),
            title: 'Updated Feast',
            donationImages: ['/uploads/keep_this.jpg'], // Existing images passed in body
            foodItems: []
        };
        req.files = []; // No new files uploaded

        Donation.findByIdAndUpdate.resolves({ _id: req.body.donationId });

        // Act
        await donationController.submitEditDonationForm(req, res, next);
        
        // Assert
        // 1. Verify no donation images were deleted (unlinkSync might be called for item images if any)
        expect(fs.unlinkSync.calledWith('public/uploads/keep_this.jpg')).to.be.false;

        // 2. Verify the database was updated with the OLD image path
        const updatedData = Donation.findByIdAndUpdate.getCall(0).args[1];
        expect(updatedData.images[0]).to.equal('/uploads/keep_this.jpg');

        // 3. Verify the successful HTTP response
        expect(res.status.calledWith(200)).to.be.true;
    });

    // --- Test Case 3: Failure when donation is not found in the database ---
    it('should return a 404 error if the donation to update is not found', async () => {
        // Arrange
        req.body = {
            donationId: new mongoose.Types.ObjectId().toString(),
            foodItems: []
        };
        Donation.findByIdAndUpdate.resolves(null); // Simulate DB returning nothing

        // Act
        await donationController.submitEditDonationForm(req, res, next);

        // Assert
        expect(res.status.calledWith(404)).to.be.true;
        expect(res.json.calledWithMatch({ success: false, message: /Donation not found/ })).to.be.true;
    });
    
    // --- Test Case 4: Failure with an invalid donationId ---
    it('should return a 400 error if the donationId is invalid', async () => {
        // Arrange
        req.body = {
            donationId: 'invalid-id-format', // Invalid ID
            foodItems: []
        };
        
        // Act
        await donationController.submitEditDonationForm(req, res, next);

        // Assert
        expect(res.status.calledWith(400)).to.be.true;
        expect(res.json.calledWithMatch({ success: false, message: 'Invalid donation ID.' })).to.be.true;
        // Verify we didn't even try to update the database
        expect(Donation.findByIdAndUpdate.notCalled).to.be.true;
    });
});