/*\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\
App/Filename : AUTHBASE/routes/authRoutes.js
Author       : RAk3rman
\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\*/

//Login Page Route - Auth
exports.loginPage = function (req, res) {
    res.render('pages/login.ejs', {title: 'Login', messages: req.flash('loginMessage') })
};

//Signup Page Route - Auth
exports.signupPage = function (req, res) {
    res.render('pages/sign_up.ejs', {title: 'Sign Up', messages: req.flash('signupMessage')})
};
