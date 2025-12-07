// Import core packages
require('dotenv').config();
const express = require('express');
const path = require('path');
const ejs = require('ejs');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const morgan = require('morgan');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local');


// Import custom modules
const connectDB = require('./src/config/db');
const catchAsync = require('./src/utils/catchAsync');
const ExpressError = require('./src/utils/ExpressError');

const User = require('./src/models/user.model');
const DonorProfile = require('./src/models/donorprofile.model');
const NGOProfile = require('./src/models/ngoprofile.model');
const VolunteerProfile = require('./src/models/volunteerprofile.model');


// Import routes
const homeRoutes = require('./src/routes/home.routes');
const authRoutes = require('./src/routes/auth.routes');
const donationRoutes = require('./src/routes/donation.routes');
const donorRoutes = require('./src/routes/donor.routes');
const ngoRoutes = require('./src/routes/ngo.routes');
const volunteerRoutes = require('./src/routes/volunteer.routes');





// --------------------- INITIALIZE EXPRESS APP ---------------------
const app = express();
const PORT = process.env.PORT || 3000;
const SESSION_SECRET = process.env.SESSION_SECRET || 'thisshouldbeabettersecret!';
connectDB();





// --------------------- SERVER AND SOCKET.IO SETUP ---------------------
const http = require('http');
const { Server } = require('socket.io');
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// ✅ Make io globally available
global.io = io;

// ✅ Track connected users
const onlineUsers = new Map();

io.on("connection", socket => {
    console.log("Socket connected:", socket.id);

    socket.on("register-user", userId => {
        onlineUsers.set(userId.toString(), socket.id);
        console.log("User registered for notifications:", userId);
    });

    socket.on("disconnect", () => {
        for (let [key, value] of onlineUsers.entries()) {
            if (value === socket.id) {
                onlineUsers.delete(key);
                break;
            }
        }
    });
});

// ✅ Export onlineUsers so model can access it
global.onlineUsers = onlineUsers;



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
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy({ usernameField: "email" }, User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Middleware to pass current user to all templates
app.use((req, res, next) => {
    res.locals.user = req.user;
    console.log('Current user:', req.user);
    next();
});

// Add notification count to res.locals for navbar
app.use(async (req, res, next) => {
    if (req.user) {
        try {
            const Notification = require('./src/models/notification.model');
            // fetch 10 most recent notifications where notReaded is true
            const notifications = await Notification.find({ userId: req.user._id, notReaded: true })
                .sort({ createdAt: -1 })
                .limit(10);
            
            let notificationsEnabled = false;
            const userRole = req.user.role;
            if (userRole === 'Donor') {
                const donorProfile = await DonorProfile.findOne({ userId: req.user._id });
                notificationsEnabled = donorProfile ? donorProfile.notificationsEnabled : false;
            } else if (userRole === 'NGO') {
                const ngoProfile = await NGOProfile.findOne({ userId: req.user._id });
                notificationsEnabled = ngoProfile ? ngoProfile.notificationsEnabled : false;
            } else if (userRole === 'Volunteer') {
                const volunteerProfile = await VolunteerProfile.findOne({ userId: req.user._id });
                notificationsEnabled = volunteerProfile ? volunteerProfile.notificationsEnabled : false;
            }

            res.locals.popNotifications = notifications;
            res.locals.unreadCount = notifications.filter(n => n.notReaded).length;
            res.locals.notificationsEnabled = notificationsEnabled;
        } catch (err) {
            console.error("Error fetching unread notifications count:", err);
            res.locals.unreadCount = 0;
        }
    } else {
        res.locals.unreadCount = 0;
    }
    next();
});





// --------------------- ROUTES SETUP ---------------------
app.use('/', homeRoutes);
app.use('/auth', authRoutes);
app.use('/donations', donationRoutes);
app.use('/donor', donorRoutes);
app.use('/ngo', ngoRoutes);
app.use('/volunteer', volunteerRoutes);

app.all(/(.*)/, (req, res, next) => {
    res.status(404).render('404', {
        activePage: 'notFound',
        pageTitle: '404 Not Found | AnnaMitra',
        messageType: 'danger',
        message: 'Page not found!'
    })
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message)
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


// app.listen(PORT, '0.0.0.0', () => {
//     console.log(`Server is running on http://localhost:${PORT}`);
// });

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server with Socket.IO is running on http://localhost:${PORT}`);
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
