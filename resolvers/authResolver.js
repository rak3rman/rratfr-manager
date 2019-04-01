/*\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\
App/Filename : AUTHBASE/resolvers/authResolver.js
Author       : RAk3rman
\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\*/

//User Auth Check
exports.isLoggedIn = function (req, res, next) {
    // If authorized, allow request
    if (req.isAuthenticated())
        return next();
    // If unauthorized, redirect to login page
    res.redirect('/login');
};
