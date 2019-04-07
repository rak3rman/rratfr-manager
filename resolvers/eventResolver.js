/*\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\
App/Filename : rratfr-manager/resolvers/socketResolver.js
Author       : RAk3rman
\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\*/
let event = require('../models/eventsModel.js');
let dataStore = require('data-store');
let storage = new dataStore({path: './config/sysConfig.json'});
let debug_mode = storage.get('debug_mode');
let socket = require('../resolvers/socketResolver.js');

//Save event and send through socket.io
exports.save_event = function(sent_category, sent_desc) {
    let newEvent = new event({
        event_category: sent_category,
        event_description: sent_desc
    });
    newEvent.save(function (err, created_event) {
        if (err) {
            console.log("EVENT Resolver: Save failed: " + err);
        } else {
            if (debug_mode === "true") {
                console.log('EVENT Resolver: Event Logged: ' + JSON.stringify(created_event));
            }
            socket.sendEvent(sent_category, sent_desc, created_event.created_date);
        }
    });
};