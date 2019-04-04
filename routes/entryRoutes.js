/*\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\
App/Filename : rratfr-manager/routes/entryRoutes.js
Author       : RAk3rman
\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\*/

module.exports = function (app) {
    let auth = require('../resolvers/authResolver.js');
    let entry = require('../resolvers/entryResolver.js');

    app.route('/api/entry/create')
        .post(auth.isLoggedIn, entry.create_entry);

    //app.route('/api/entry/details')
    //    .get(auth.isLoggedIn, entry.node_details);

    app.route('/api/entry/details/all')
        .get(auth.isLoggedIn, entry.entry_details_all);

    //app.route('/api/entry/edit')
    //    .post(auth.isLoggedIn, entry.node_edit);

    app.route('/api/statistics')
        .get(entry.get_open_statistics);

    app.route('/api/statistics/admin')
        .get(auth.isLoggedIn, entry.get_admin_statistics);

};