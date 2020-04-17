/*\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\
App/Filename : rratfr-manager/routes/entryRoutes.js
Author       : RAk3rman
\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\*/

module.exports = function (app) {
    let auth = require('../resolvers/authResolver.js');
    let entry = require('../resolvers/entryResolver.js');
    let dataStore = require('data-store');
    let storage = new dataStore({path: './config/sysConfig.json'});
    //Auth Routes
    let loginCheck;
    const { requiresAuth } = require('express-openid-connect');
    if (storage.get('passport_auth0') === 'true') {
        loginCheck = requiresAuth();
    } else {
        loginCheck = auth.isLoggedIn;
    }

    app.route('/api/entry/create')
        .post(loginCheck, entry.create_entry);

    //app.route('/api/entry/details')
    //    .get(loginCheck, entry.entry_details);

    //app.route('/api/entry/details/all')
    //    .get(loginCheck, entry.entry_details_all);

    app.route('/api/entry/edit')
        .post(loginCheck, entry.entry_edit);

    app.route('/api/entry/delete')
        .post(loginCheck, entry.entry_delete);

    app.route('/api/entry/sort')
        .post(loginCheck, entry.entry_sort);

    app.route('/api/entry/timing/update')
        .post(loginCheck, entry.entry_timing_update);

    app.route('/api/voting/results')
        .get(entry.return_results);

    app.route('/api/voting/people\'s-choice')
        .post(entry.submit_vote)
        .get(loginCheck, entry.return_all_votes);

    app.route('/api/voting/people\'s-choice/re-tabulate')
        .post(loginCheck, entry.re_tabulate_votes);

    app.route('/api/voting/judges-choice/assign')
        .post(loginCheck, entry.select_judges_choice);

    app.route('/api/voting/judges-choice/reset')
        .post(loginCheck, entry.reset_judges_choice);

    app.route('/api/settings')
        .get(loginCheck, entry.settings_get)
        .post(loginCheck, entry.settings_update);
};