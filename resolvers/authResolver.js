/*\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\
App/Filename : rratfr-manager/resolvers/authResolver.js
Author       : RAk3rman
\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\*/
const { requiresAuth } = require('express-openid-connect');
let dataStore = require('data-store');
let storage = new dataStore({path: './config/sysConfig.json'});

//User Auth Check
exports.isLoggedIn = function (req, res, next) {
    if (storage.get('passport_auth0') === 'true') {
        //Passport Auth0 Route
        requiresAuth();
    } else {
        //Passport Local Login Route
        // If authorized, allow request
        if (req.isAuthenticated())
            return next();
        // If unauthorized, redirect to login page
        res.redirect('/login');
    }
};
