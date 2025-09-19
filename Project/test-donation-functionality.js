// Test script to verify donation functionality
// Run this with: node test-donation-functionality.js

const mongoose = require('mongoose');
const Donation = require('./src/models/donation.model');
const DonationRequest = require('./src/models/donationrequest.model');
const User = require('./src/models/user.model');

// Test database connection
async function testDatabaseConnection() {
    try {
        await mongoose.connect('mongodb://localhost:27017/annasetu', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ Database connected successfully');
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        return false;
    }
}

// Test models
async function testModels() {
    try {
        // Test Donation model
        const donationCount = await Donation.countDocuments();
        console.log(`✅ Donation model working - Found ${donationCount} donations`);
        
        // Test DonationRequest model
        const requestCount = await DonationRequest.countDocuments();
        console.log(`✅ DonationRequest model working - Found ${requestCount} requests`);
        
        // Test User model
        const userCount = await User.countDocuments();
        console.log(`✅ User model working - Found ${userCount} users`);
        
        return true;
    } catch (error) {
        console.error('❌ Model test failed:', error.message);
        return false;
    }
}

// Test OTP functionality
async function testOTPFields() {
    try {
        // Check if OTP fields exist in donation schema
        const donationSchema = Donation.schema.obj;
        
        if (donationSchema.otp && donationSchema.otpExpiry && donationSchema.otpGeneratedAt) {
            console.log('✅ OTP fields are properly defined in donation schema');
            return true;
        } else {
            console.log('❌ OTP fields are missing from donation schema');
            return false;
        }
    } catch (error) {
        console.error('❌ OTP fields test failed:', error.message);
        return false;
    }
}

// Main test function
async function runTests() {
    console.log('🧪 Starting donation functionality tests...\n');
    
    const dbConnected = await testDatabaseConnection();
    if (!dbConnected) {
        console.log('\n❌ Tests failed - Database connection required');
        process.exit(1);
    }
    
    const modelsWorking = await testModels();
    const otpFieldsWorking = await testOTPFields();
    
    console.log('\n📊 Test Results:');
    console.log(`Database Connection: ${dbConnected ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Models: ${modelsWorking ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`OTP Fields: ${otpFieldsWorking ? '✅ PASS' : '❌ FAIL'}`);
    
    if (dbConnected && modelsWorking && otpFieldsWorking) {
        console.log('\n🎉 All tests passed! Donation functionality is ready.');
    } else {
        console.log('\n⚠️  Some tests failed. Please check the implementation.');
    }
    
    // Close database connection
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
}

// Run tests
runTests().catch(console.error);
