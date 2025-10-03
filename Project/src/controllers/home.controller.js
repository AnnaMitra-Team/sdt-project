const User = require('../models/user.model');
const Donation = require('../models/donation.model');
const catchAsync = require('../utils/catchAsync');
const safeRender = require('../utils/safeRender');


// Render home page
module.exports.renderHomePage = (req, res, next) => {
    safeRender(res, 'home', { 
        activePage: 'home',
        pageTitle: 'Welcome to AnnaMitra',
        messageType: null,
        message: null
    }, next);
}

// Render about page
module.exports.renderAboutPage = (req, res, next) => {
    safeRender(res, 'about', { 
        activePage: 'about',
        pageTitle: 'About | AnnaMitra',
        messageType: null,
        message: null 
    }, next);
}

// Render contact page
module.exports.renderContactPage = (req, res, next) => {
    safeRender(res, 'contact', { 
        activePage: 'contact',
        pageTitle: 'Contact us now | AnnaMitra',
        messageType: null,
        message: null
    }, next);
}

module.exports.testRoute = catchAsync(async (req, res) => {
    // throw new Error('testing error');
    try {
        // fetch donations sorted by date - newest first
        const donations = await Donation.find({}).sort({ createdAt: -1 });
        res.json(donations);


        // const users = await User.find({role: 'Volunteer'}, {_id:1, firstName: 1});
        // res.json(users);
        // console.log(users);

        // const donations = await Donation.find({});
        // res.json(donations);
    }
    catch (error) {
        console.error('Error in testRoute:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
})