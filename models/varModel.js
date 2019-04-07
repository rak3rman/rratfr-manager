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
    var_value: {
        type: Date,
        required: true,
    },
});

module.exports = mongoose.model('variables', varSchema);