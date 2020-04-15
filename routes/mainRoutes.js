/*\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\
App/Filename : rratfr-manager/routes/mainRoutes.js
Author       : RAk3rman
\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\*/
let dataStore = require('data-store');
let storage = new dataStore({path: './config/sysConfig.json'});

//Admin Dashboard Page Route
exports.adminDashRoute = function (req, res) {
    res.render('pages/admin_dashboard.ejs', {title: 'Dashboard', user: req.user})
};

//Entry Management Page Route
exports.entryManagementRoute = function (req, res) {
    res.render('pages/entry_management.ejs', {title: 'Entry Management', user: req.user})
};

//Voting Management Page Route
exports.votingManagementRoute = function (req, res) {
    res.render('pages/voting_management.ejs', {title: 'Voting Management', user: req.user})
};

//Chuck a Duck Race Page Route
exports.duckManagementRoute = function (req, res) {
    res.render('pages/duck_management.ejs', {title: 'Chuck a Duck Race Management', user: req.user})
};

//Race Timing Page Route
exports.timingRoute = function (req, res) {
    res.render('pages/timing_interface.ejs', {title: 'Timing', user: req.user})
};

//Public Results Page Route
exports.publicResultsRoute = function (req, res) {
    res.render('pages/public_results.ejs', {title: 'Results'})
};

//Live Results Page Route
exports.liveResultsRoute = function (req, res) {
    res.render('pages/live_results.ejs', {title: 'Live Results'})
};

//Results (Historic) Dashboard Page Route
exports.historicResultsRoute = function (req, res) {
    res.render('pages/historic_results.ejs', {title: 'Historic Results'})
};

//People's Choice Voting Page Route
exports.peoplesChoiceRoute = function (req, res) {
    res.render('pages/peoples_choice.ejs', {title: "People's Choice Voting", user: req.user})
};

//Display Dashboard Page Route
exports.displayDashRoute = function (req, res) {
    res.render('pages/results_display_board.ejs', {title: 'Results', user: req.user})
};

//Settings Page Route
exports.settingsRoute = function (req, res) {
    res.render('pages/settings.ejs', {title: 'Admin Settings', user: req.user})
};