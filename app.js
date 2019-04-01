/*\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\
App/Filename : AUTHBASE/app.js
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
    console.log('Auth Config Manager: MongoDB URL Set to DEFAULT: mongodb://localhost:27017');
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

//Resolvers
let auth = require('./resolvers/authResolver.js');

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

//End of Initialize Packages and Routers - - - - - - - -


//===================================================//
//       --- AUTHBASE Config Routes/Logic  ---       //
//===================================================//

//Secret Dashboard
app.get('/', auth.isLoggedIn, mainRouter.homeRoute);

//Auth Routes
app.get('/login', authRouter.loginPage);
app.get('/signup', authRouter.signupPage);
app.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/login');
});
app.post('/login', passport.authenticate('local-login', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}));
app.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/',
    failureRedirect: '/signup',
    failureFlash: true
}));

//End of AUTHBASE Config Routes/Logic - - - - - - - - -


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

//Port Listen
let http = require('http');
let server = http.createServer(app);
server.listen(storage.get('console_port'), function () {
    console.log(' ');
    console.log('============================================');
    console.log('  Auth-WebFramework-NodeJS | RAk3rman 2019  ');
    console.log('============================================');
    console.log('Web Page Accessable at: ' + ip.address() + ":" + storage.get('console_port'));
    console.log('MongoDB Accessed at: ' + storage.get('mongodb_url'));
    console.log(' ');
});

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
mongoose.connect(storage.get('mongodb_url'), {useNewUrlParser: true, connectTimeoutMS: 10000});

//End of External Connections Setup - - - - - - - - - -

//Export Express
module.exports = app;
