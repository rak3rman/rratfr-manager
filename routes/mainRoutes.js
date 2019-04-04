/*\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\
App/Filename : rratfr-manager/routes/mainRoutes.js
Author       : RAk3rman
\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\*/

//Public Dashboard Page Route
exports.publicDashRoute = function (req, res) {
    res.render('pages/public_dashboard.ejs', {title: 'Dashboard', user: req.user})
};

//Admin Dashboard Page Route
exports.adminDashRoute = function (req, res) {
    res.render('pages/admin_dashboard.ejs', {title: 'Dashboard', user: req.user})
};

//Entry List Page Route
exports.entryListRoute = function (req, res) {
    res.render('pages/entry_list.ejs', {title: 'Entry List', user: req.user})
};

//Time Interface Page Route
exports.timingRoute = function (req, res) {
    res.render('pages/timing_interface.ejs', {title: 'Timing', user: req.user})
};