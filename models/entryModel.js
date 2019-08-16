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
    img: {
        data: Buffer,
        contentType: String,
        required: false,
    },
    category: {
        type: String,
        required: true,
    },
    check_status: {
        type: String,
        default: "NOT CHECKED",
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
        default: "NT - WAITING",
    },
    raw_final_time: {
        type: String,
        default: "999999",
    },
    start_time: {
        type: Date,
        default: ""
    },
    end_time: {
        type: Date,
        default: ""
    },
    created_date: {
        type: Date,
        default: Date.now
    },
});

module.exports = mongoose.model('entries', entrySchema);