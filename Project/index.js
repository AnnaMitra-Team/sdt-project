// Import core packages
require('dotenv').config();
const express = require('express');
const path = require('path');
const ejs = require('ejs');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const morgan = require('morgan');
const session = require('express-session');
const passpord = require('passport');
const LocalStrategy = require('passport-local');

// Import custom modules
const connectDB = require('./src/config/db');
const catchAsync = require('./src/utils/catchAsync');
const ExpressError = require('./src/utils/ExpressError');

const User = require('./src/models/user.model');


// Import routes
const homeRoutes = require('./src/routes/home.routes');
const authRoutes = require('./src/routes/auth.routes');
const donationRoutes = require('./src/routes/donation.routes');
const donorRoutes = require('./src/routes/donor.routes');
const ngoRoutes = require('./src/routes/ngo.routes');
const volunteerRoutes = require('./src/routes/volunteer.routes');
const adminRoutes = require('./src/routes/admin.routes');





// --------------------- INITIALIZE EXPRESS APP ---------------------
const app = express();
const PORT = process.env.PORT || 3000;
const SESSION_SECRET = process.env.SESSION_SECRET || 'thisshouldbeabettersecret!';
connectDB();





// --------------------- MIDDLEWARE SETUP ---------------------
// Body parser middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/src/views')); 

// Method override middleware for PUT and DELETE requests
app.use(methodOverride('_method'));

// Setup logger middleware - morgan
// app.use(morgan('common'));
app.use(morgan(':method :url :status :response-time ms', {
  skip: function (req, res) {
    return req.url.match(/\.(css|js|png|jpg|ico)$/);
  }
}));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration
const sessionConfig = {
    name: 'session',
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionConfig));

// Passport configuration
app.use(passpord.initialize());
app.use(passpord.session());
passpord.use(new LocalStrategy({ usernameField: "email" }, User.authenticate()));

passpord.serializeUser(User.serializeUser());
passpord.deserializeUser(User.deserializeUser());

// Middleware to pass current user to all templates
app.use((req, res, next) => {
    res.locals.user = req.user;
    console.log('Current user:', req.user);
    next();
});





// --------------------- ROUTES SETUP ---------------------
app.use('/', homeRoutes);
app.use('/auth', authRoutes);
app.use('/donations', donationRoutes);
app.use('/donor', donorRoutes);
app.use('/ngo', ngoRoutes);
app.use('/volunteer', volunteerRoutes);
app.use('/admin', adminRoutes);

app.all(/(.*)/, (req, res, next) => {
    res.status(404).render('404', {
        activePage: 'notFound',
        pageTitle: '404 Not Found | AnnaMitra',
        messageType: 'danger',
        message: 'Page not found!'
    })
})

app.use((err, req, res, next) => {
    const {statusCode = 500} = err;
    if(!err.message)
        err.message = 'Something went wrong!';

    console.log(err);

    res.status(statusCode).render('error', {
        activePage: 'errorPage',
        pageTitle: 'Error | AnnaMitra',
        messageType: 'danger',
        message: err.message,
        error: err
    });
})


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});






// const { MongoClient, ServerApiVersion } = require('mongodb');
// const uri = "mongodb+srv://hardipmuliyasiya:diphar81!@annamitracluster.ggnex67.mongodb.net/?retryWrites=true&w=majority&appName=annamitraCluster";

// // Create a MongoClient with a MongoClientOptions object to set the Stable API version
// const client = new MongoClient(uri, {
//   serverApi: {
//     version: ServerApiVersion.v1,
//     strict: true,
//     deprecationErrors: true,
//   }
// });

// async function run() {
//   try {
//     // Connect the client to the server	(optional starting in v4.7)
//     await client.connect();
//     // Send a ping to confirm a successful connection
//     await client.db("admin").command({ ping: 1 });
//     console.log("Pinged your deployment. You successfully connected to MongoDB!");
//   } finally {
//     // Ensures that the client will close when you finish/error
//     await client.close();
//   }
// }
// run().catch(console.dir);
