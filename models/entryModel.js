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
    timing_status: {
        type: String,
        default: "waiting",
    },
    final_place: {
        type: String,
        default: "NA",
    },
    final_time: {
        type: String,
        default: "NT",
    },
    raw_final_time: {
        type: String,
        default: "NT",
    },
    start_time: {
        type: Date,
        default: Date.now
    },
    end_time: {
        type: Date,
        default: Date.now
    },
    created_date: {
        type: Date,
        default: Date.now
    },
});

module.exports = mongoose.model('entries', entrySchema);