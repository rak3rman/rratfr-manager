/*\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\
App/Filename : LEMAConsole/models/varModel.js
Author       : RAk3rman
\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\*/
let mongoose = require('mongoose');

let varSchema = mongoose.Schema({
    var_name: {
        type: String,
        required: true,
    },
    var_date: {
        type: Date,
        required: false,
    },
    var_value: {
        type: String,
        required: false,
    },
});

module.exports = mongoose.model('variables', varSchema);