/*\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\
App/Filename : rratfr-manager/models/voteModel.js
Author       : RAk3rman
\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\*/
let mongoose = require('mongoose');

let voteSchema = mongoose.Schema({
    bib_number: {
        type: String,
        required: true,
    },
    user_ip: {
        type: String,
        required: true,
    },
    user_data: {
        type: String,
        required: true,
    },
    created_date: {
        type: Date,
        default: Date.now
    },
});

module.exports = mongoose.model('vote', voteSchema);