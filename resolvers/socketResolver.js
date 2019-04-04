/*\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\
App/Filename : rratfr-manager/resolvers/socketResolver.js
Author       : RAk3rman
\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\*/
let entry = require('../models/entryModel.js');
let dataStore = require('data-store');
let storage = new dataStore({path: './config/sysConfig.json'});
let debug_mode = storage.get('debug_mode');
let io;
//Socket.io on connection
module.exports = function (server) {
    io = require('socket.io')(server);
    io.on('connection', function (socket) {
        console.log('Socket.io: User Connected');
        getStatistics();
        socket.on('disconnect', function () {
            console.log('Socket.io: User Disconnected');
        });
    });
};

//Get Statistics and send
function getStatistics() {
    let total_entries_count = 0;
    let missing_safety_count = 0;
    let entries_in_water_count = 0;
    let entries_finished_count = 0;
    entry.find({}, function (err, listed_entries) {
        if (err) {
            console.log("ENTRY Resolver: Retrieve failed: " + err);
            io.emit('error', err);
        } else {
            for (let i in listed_entries) {
                if (listed_entries[i]["safety_status"] === "false") {
                    missing_safety_count += 1;
                }
                if (listed_entries[i]["start_time"] != null) {
                    entries_in_water_count += 1;
                }
                if (listed_entries[i]["end_time"] != null) {
                    entries_finished_count += 1;
                }
                total_entries_count += 1;
            }
            if (debug_mode === "true") { console.log("ENTRY Resolver: Statistics Sent.")}
        }
        io.emit('race_data', {
            total_entries: total_entries_count,
            missing_safety: missing_safety_count,
            entries_in_water: entries_in_water_count,
            entries_finished: entries_finished_count
        })
    });
}