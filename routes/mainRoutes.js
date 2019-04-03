/*\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\
App/Filename : rratfr-manager/routes/mainRoutes.js
Author       : RAk3rman
\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\*/

//Home Page Route - Main
exports.homeRoute = function (req, res) {
    res.render('pages/dashboard.ejs', {title: 'Home', user: req.user})
};

//Time Interface Page Route
exports.timingRoute = function (req, res) {
    res.render('pages/timing_interface.ejs', {title: 'Timing', user: req.user})
};