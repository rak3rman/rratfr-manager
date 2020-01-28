/*\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\
App/Filename : rratfr-manager/routes/authRoutes.js
Author       : RAk3rman
\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\*/

//Login Page Route - Auth
exports.loginPage = function (req, res) {
    res.render('pages/auth_login.ejs', {title: 'Login', messages: req.flash('loginMessage') })
};

//Signup Page Route - Auth
exports.signupPage = function (req, res) {
    res.render('pages/auth_signup.ejs', {title: 'Sign Up', messages: req.flash('signupMessage')})
};
