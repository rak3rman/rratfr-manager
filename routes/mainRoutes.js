/*\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\
App/Filename : rratfr-manager/routes/mainRoutes.js
Author       : RAk3rman
\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\*/
let dataStore = require('data-store');
let storage = new dataStore({path: './config/sysConfig.json'});

//Public Results Page Route
exports.liveResultsRoute = function (req, res) {
    res.render('pages/live_results.ejs', {title: 'Live Results'})
};

//Results (Historic) Dashboard Page Route
exports.historicResultsRoute = function (req, res) {
    res.render('pages/historic_results.ejs', {title: 'Historic Results'})
};

//Display Dashboard Page Route
exports.displayDashRoute = function (req, res) {
    res.render('pages/display_live_results.ejs', {title: 'Dashboard', user: req.user})
};

//Display Dashboard Page Route
exports.peoplesChoiceRoute = function (req, res) {
    res.render('pages/peoples_choice.ejs', {title: "People's Choice Voting", user: req.user})
};

//Admin Dashboard Page Route
exports.adminDashRoute = function (req, res) {
    res.render('pages/admin_dashboard.ejs', {title: 'Dashboard', user: req.user})
};

//Entry Management Page Route
exports.entryMangementRoute = function (req, res) {
    res.render('pages/entry_management.ejs', {title: 'Entry Management', user: req.user})
};

//Time Interface Page Route
exports.timingRoute = function (req, res) {
    res.render('pages/timing_interface.ejs', {title: 'Timing', user: req.user})
};

//Settings Page Route
exports.settingsRoute = function (req, res) {
    res.render('pages/settings.ejs', {title: 'Admin Settings', user: req.user})
};