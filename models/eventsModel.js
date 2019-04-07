/*\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\
App/Filename : rratfr-manager/models/eventsModel.js
Author       : RAk3rman
\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\*/
let mongoose = require('mongoose');

let eventSchema = mongoose.Schema({
    event_category: {
        type: String,
        required: true,
    },
    event_description: {
        type: String,
        required: true,
    },
    created_date: {
        type: Date,
        default: Date.now
    },
});

module.exports = mongoose.model('events', eventSchema);