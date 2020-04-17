/*\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\
App/Filename : rratfr-manager/app.js
Description  : Initializes nodejs
Author       : RAk3rman
\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\*/

//===================================================//
//     --- Initialize Packages and Routers ---       //
//===================================================//

//Declare Packages
let express = require('express');
let session = require('express-session');
let morgan = require('morgan');
let createError = require('http-errors');
let cookieParser = require('cookie-parser');
let bodyParser = require('body-parser');
let ip = require('ip');
let uuidv4 = require('uuid/v4');
let mongoose = require('mongoose');
let passport = require('passport');
let flash = require('connect-flash');
let helmet = require('helmet');

//Setup Local Database
let dataStore = require('data-store');
let storage = new dataStore({path: './config/sysConfig.json'});

//System Config Checks - - - - - - - - - - - - - - - - -
//Session Secret Check
let session_secret = storage.get('session_secret');
if (session_secret === undefined) {
    let newSecret = uuidv4();
    storage.set('session_secret', newSecret);
    console.log('Config Manager: Session Secret Set - ' + newSecret);
}
//Console Port Check
let console_port = storage.get('console_port');
if (console_port === undefined) {
    storage.set('console_port', 3000);
    console.log('Config Manager: Port Set to DEFAULT: 3000');
}
//MongoDB URL Check
let mongodb_url = storage.get('mongodb_url');
if (mongodb_url === undefined) {
    storage.set('mongodb_url', 'mongodb://localhost:27017');
    console.log('Config Manager: MongoDB URL Set to DEFAULT: mongodb://localhost:27017');
}
//Debug Mode Check
let debug_mode = storage.get('debug_mode');
if (debug_mode === undefined) {
    storage.set('debug_mode', 'false');
    console.log('Config Manager: Debug Mode Set to DEFAULT: false');
}
//Passport Auth0 Mode
let passport_auth0 = storage.get('passport_auth0');
if (passport_auth0 === undefined) {
    storage.set('passport_auth0', 'false');
    console.log('Config Manager: Passport Auth0 Mode Set to DEFAULT: false');
}
//Single Sign Up Mode
let signup_mode = storage.get('signup_mode');
if (signup_mode === undefined) {
    storage.set('signup_mode', 'true');
    console.log('Config Manager: Signup Mode Set to DEFAULT: true');
}
//Production mode check
let production = storage.get('production');
if (production === undefined) {
    storage.set('production', 'true');
    console.log('Config Manager: Production to DEFAULT: true');
}
//Passport Auth0 - The URL where the application is served
let passport_auth0_baseURL = storage.get('passport_auth0_baseURL');
if (passport_auth0_baseURL === undefined) {
    storage.set('passport_auth0_baseURL', 'https://localhost:3000');
    console.log('Config Manager: Passport Auth0 Domain Set to DEFAULT: https://localhost:3000');
}
//Passport Auth0 - The issuer base url from Auth0
let passport_auth0_issuerURL = storage.get('passport_auth0_issuerURL');
if (passport_auth0_issuerURL === undefined) {
    storage.set('passport_auth0_issuerURL', '');
    console.log('Config Manager: Passport Auth0 Domain Set to DEFAULT: undefined');
}
//Passport Auth0 - The Client ID found in your Application settings
let passport_auth0_clientID = storage.get('passport_auth0_clientID');
if (passport_auth0_clientID === undefined) {
    storage.set('passport_auth0_clientID', '');
    console.log('Config Manager: Passport Auth0 Client Secret Set to DEFAULT: undefined');
}
//End of System Config Checks - - - - - - - - - - - - - -

//Declare App
const app = express();
app.set('view engine', 'ejs');

//Initialize Exit Options
let exitOpt = require('./config/exitOpt.js');
setTimeout(exitOpt.testCheck, 3000);

//Routers
let authRouter = require('./routes/authRoutes.js');
let mainRouter = require('./routes/mainRoutes.js');
let entryRouter = require('./routes/entryRoutes.js');

//Resolvers
let auth = require('./resolvers/authResolver.js');
let socket = require('./resolvers/socketResolver.js');

//Passport Setup
require('./sys_funct/passport.js')(passport);

//Express Processes/Packages Setup
app.use(session({
    secret: storage.get('session_secret'),
    resave: true,
    saveUninitialized: true
}));
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

//Import Static Files to Webpages
app.use('/static', express.static(process.cwd() + '/static'));

//Application Security
app.use(helmet());
app.enable('trust proxy');

//End of Initialize Packages and Routers - - - - - - - -


//===================================================//
//    --- RRATFR Manager Config Routes/Logic  ---    //
//===================================================//

//Auth Routes
let loginCheck;
const { requiresAuth } = require('express-openid-connect');
if (storage.get('passport_auth0') === 'true') {
    //Configure Passport Auth0
    if (passport_auth0_baseURL !== undefined || passport_auth0_clientID !== undefined) {
        //Passport Setup
        const { auth } = require("express-openid-connect");
        app.use(session({
            secret: storage.get('session_secret'),
            cookie: {
                // Sets the session cookie to expire after 12 hours.
                maxAge: 7 * 24 * 60 * 60 * 1000
            }
        }));
        // Auth router attaches /login, /logout, and /callback routes to the baseURL
        app.use(auth({
            required: false,
            auth0Logout: true,
            baseURL: storage.get('passport_auth0_baseURL'),
            issuerBaseURL: storage.get('passport_auth0_issuerURL'),
            clientID: storage.get('passport_auth0_clientID'),
            appSessionSecret: storage.get('session_secret'),
            handleCallback: async function (req, res, next) {
                res.redirect("/dashboard");
            }
        }));
        loginCheck = requiresAuth();
    } else {
        console.log("PASSPORT AUTH0 SETUP FAILURE: Please complete the configuration in /config/sysConfig.json to use Passport Auth0");
    }
} else {
    //Configure Passport Local Login
    app.get('/login', authRouter.loginPage);
    app.get('/logout', function (req, res) {
        req.logout();
        res.redirect('/login');
    });
    app.post('/login', passport.authenticate('local-login', {
        successRedirect: '/dashboard',
        failureRedirect: '/login',
        failureFlash: true
    }));
    if (storage.get('signup_mode') === 'true') {
        app.get('/signup', authRouter.signupPage);
        app.post('/signup', passport.authenticate('local-signup', {
            successRedirect: '/dashboard',
            failureRedirect: '/signup',
            failureFlash: true
        }));
    }
    loginCheck = auth.isLoggedIn;
}

//Forward Entry Routes
entryRouter(app);

//Admin Dashboard
app.get('/dashboard', loginCheck, mainRouter.adminDashRoute);
//Entry Management
app.get('/entry/management', loginCheck, mainRouter.entryManagementRoute);
//Voting Management
app.get('/voting/management', loginCheck, mainRouter.votingManagementRoute);
//Chuck a Duck Race Management
app.get('/chuck-a-duck/management', loginCheck, mainRouter.duckManagementRoute);
//Timing Interface
app.get('/timing', loginCheck, mainRouter.timingRoute);
//Public Results
app.get('/', mainRouter.publicResultsRoute);
//Live Results
app.get('/results/live', mainRouter.liveResultsRoute);
//Historical Results
app.get('/results/historic', mainRouter.historicResultsRoute);
//People's Choice Voting
app.get('/voting/people\'s-choice', mainRouter.peoplesChoiceRoute);
//Display Dashboard
app.get('/display', mainRouter.displayDashRoute);
//Admin Settings
app.get('/settings', loginCheck, mainRouter.settingsRoute);

//End of RRATFR Manager Config Routes/Logic - - - - - - - - -


//===================================================//
//              --- Error Handlers ---               //
//===================================================//

//404 - Send to Error Handler
app.use(function (req, res, next) {
    next(createError(404));
});

// Error Handler Logic
app.use(function (err, req, res, next) {
    //Determine Message
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    //Render Error Page
    res.status(err.status || 500);
    res.render('pages/error.ejs', {title: 'Error'});
});

//End of Error Handler - - - - - - - - - - - - - - - - -


//===================================================//
//        --- External Connections Setup ---         //
//===================================================//

if (storage.get('production') === 'false') {
    //Port Listen
    let https = require('https');
    let fs = require('fs');
    const key = fs.readFileSync('./config/dev-key.pem');
    const cert = fs.readFileSync('./config/dev.pem');
    let server = https.createServer({key, cert}, app);
    server.listen(storage.get('console_port'), () => {
        console.log(' ');
        console.log('======================================');
        console.log('      RRATFR Manager | RAk3rman       ');
        console.log('======================================');
        console.log('Running in DEVELOPMENT Mode (https)');
        console.log('Web Page Accessible at: https://' + ip.address() + ":" + storage.get('console_port'));
        console.log('MongoDB Accessed at: ' + storage.get('mongodb_url'));
        console.log(' ');
    });
    //Initialize Socket.io
    socket.socket_config(server);
} else {
    //Port Listen
    let http = require('http');
    let server = http.createServer(app);
    server.listen(storage.get('console_port'), () => {
        console.log(' ');
        console.log('======================================');
        console.log('      RRATFR Manager | RAk3rman       ');
        console.log('======================================');
        console.log('Running in PRODUCTION Mode (http)');
        console.log('Web Page Accessible at: http://' + ip.address() + ":" + storage.get('console_port'));
        console.log('MongoDB Accessed at: ' + storage.get('mongodb_url'));
        console.log(' ');
    });
    //Initialize Socket.io
    socket.socket_config(server);
}

//Database Setup
mongoose.connection.on('connected', function () {
    console.log('MongoDB: Connected')
});
mongoose.connection.on('timeout', function () {
    console.log('MongoDB: Error')
});
mongoose.connection.on('disconnected', function () {
    console.log('MongoDB: Disconnected')
});
mongoose.connect(storage.get('mongodb_url'), {useNewUrlParser: true,  useUnifiedTopology: true, connectTimeoutMS: 10000});

//End of External Connections Setup - - - - - - - - - -

//Export Express
module.exports = app;
