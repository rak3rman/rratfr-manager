/*\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\
App/Filename : rratfr-manager/routes/mainRoutes.js
Author       : RAk3rman
\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\*/
let dataStore = require('data-store');
let storage = new dataStore({path: './config/sysConfig.json'});

//Public Results Page Route
exports.liveResultsRoute = function (req, res) {
    res.render('pages/live_results.ejs', {title: 'Live Results', user: req.user})
};

//Results (Historic) Dashboard Page Route
exports.historicResultsRoute = function (req, res) {
    res.render('pages/historic_results.ejs', {title: 'Historic Results', racedate: storage.get('racedate')})
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

//Entry List Page Route
exports.entryListRoute = function (req, res) {
    res.render('pages/entry_list.ejs', {title: 'Entry List', user: req.user})
};

//Entry Check Page Route
exports.entryCheckRoute = function (req, res) {
    res.render('pages/entry_check.ejs', {title: 'Entry Check', user: req.user})
};

//Time Interface Page Route
exports.timingRoute = function (req, res) {
    res.render('pages/timing_interface.ejs', {title: 'Timing', user: req.user})
};