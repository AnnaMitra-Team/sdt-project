const mongoose = require('mongoose');
const DonorProfile = require('../models/donorprofile.model');
const { donorProfileSchema } = require('../utils/joiSchemas');

const catchAsync = require('../utils/catchAsync');

// Create Donor Profile
module.exports.createDonorProfile = async (userId, donorProfile) => {
    donorProfile.userId = userId;
    const newDonorProfile = new DonorProfile(donorProfile);
    const createdDonorProfile = await newDonorProfile.save();
    return createdDonorProfile; 
}
