/*\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\
App/Filename : rratfr-manager/models/entryModel.js
Author       : RAk3rman
\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\*/
let mongoose = require('mongoose');

let entrySchema = mongoose.Schema({
    bib_number: {
        type: String,
        required: true,
    },
    entry_name: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    safety_status: {
        type: String,
        default: "false",
    },
    start_time: {
        type: Date,
    },
    end_time: {
        type: Date,
    },
    created_date: {
        type: Date,
        default: Date.now
    },
});

module.exports = mongoose.model('entries', entrySchema);