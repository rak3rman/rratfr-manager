/*\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\
App/Filename : rratfr-manager/resolvers/socketResolver.js
Author       : RAk3rman
\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\*/
let entry = require('../models/entryModel.js');
let varSet = require('../models/varModel.js');
let dataStore = require('data-store');
let storage = new dataStore({path: './config/sysConfig.json'});
let debug_mode = storage.get('debug_mode');
let io;

//Socket.io on connection
exports.socket_config = function (server) {
    io = require('socket.io')(server);
    io.on('connection', function (socket) {
        console.log('Socket.io: User Connected');
        getStatistics();
        getEntryData();
        //Check Bib Number and Send Result
        socket.on('check_bib', function (bib_number) {
            console.log('Socket.io: Getting information for Bib #' + bib_number);
            entry.find({bib_number: bib_number}, function (err, details) {
                if (err) {
                    console.log("Socket.io: Retrieve failed: " + err);
                    socket.emit('error', err);
                } else if (details.length === 0) {
                    console.log("Socket.io: Bib number not found");
                    socket.emit('check_bib_result', 'not_found');
                } else {
                    if (details[0]["timing_status"] === "waiting") {
                        console.log("Socket.io: Bib #" + bib_number + " - Ready to Start");
                        socket.emit('check_bib_result', {
                            result: 'start_ready',
                            entry_name: details[0]["entry_name"],
                            category: details[0]["category"],
                            safety_status: details[0]["safety_status"]
                        });
                    }
                    if (details[0]["timing_status"] === "en_route") {
                        console.log("Socket.io: Bib #" + bib_number + " - Ready to Finish");
                        socket.emit('check_bib_result', {
                            result: 'finish_ready',
                            entry_name: details[0]["entry_name"],
                            category: details[0]["category"],
                            safety_status: details[0]["safety_status"]
                        });
                    }
                    if (details[0]["timing_status"] === "finished") {
                        console.log("Socket.io: Bib #" + bib_number + " - Finished");
                        socket.emit('check_bib_result', {
                            result: 'finished',
                            entry_name: details[0]["entry_name"],
                            category: details[0]["category"],
                            safety_status: details[0]["safety_status"]
                        });
                    }
                    if (details[0]["timing_status"] === "dq") {
                        console.log("Socket.io: Bib #" + bib_number + " - DQ");
                        socket.emit('check_bib_result', {
                            result: 'dq',
                            entry_name: details[0]["entry_name"],
                            category: details[0]["category"],
                            safety_status: details[0]["safety_status"]
                        });
                    }
                }
            });
        });
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
    let updated_time_total_entries;
    let updated_time_missing_safety;
    let updated_time_entries_in_water;
    let updated_time_entries_finished;
    entry.find({}, function (err, listed_entries) {
        if (err) {
            console.log("Socket.io: Retrieve failed: " + err);
            io.emit('error', err);
        } else {
            for (let i in listed_entries) {
                if (listed_entries[i]["safety_status"] === "false") {
                    missing_safety_count += 1;
                }
                if (listed_entries[i]["timing_status"] === "en_route") {
                    entries_in_water_count += 1;
                }
                if (listed_entries[i]["timing_status"] === "finished") {
                    entries_finished_count += 1;
                }
                total_entries_count += 1;
            }
            varSet.find({}, function (err, variables) {
                if (err) {
                    console.log("Socket.io: Retrieve failed: " + err);
                    io.emit('error', err);
                } else {
                    for (let i in variables) {
                        if (variables[i]["var_name"] === "updated_time_total_entries") {
                            updated_time_total_entries = variables[i]["var_value"];
                        }
                        if (variables[i]["var_name"] === "updated_time_missing_safety") {
                            updated_time_missing_safety = variables[i]["var_value"];
                        }
                        if (variables[i]["var_name"] === "updated_time_entries_in_water") {
                            updated_time_entries_in_water = variables[i]["var_value"];
                        }
                        if (variables[i]["var_name"] === "updated_time_entries_finished") {
                            updated_time_entries_finished = variables[i]["var_value"];
                        }
                    }
                    io.emit('race_data', {
                        total_entries: total_entries_count,
                        missing_safety: missing_safety_count,
                        entries_in_water: entries_in_water_count,
                        entries_finished: entries_finished_count,
                        updated_total_entries: updated_time_total_entries,
                        updated_missing_safety: updated_time_missing_safety,
                        updated_entries_in_water: updated_time_entries_in_water,
                        updated_entries_finished: updated_time_entries_finished
                    });
                    if (debug_mode === "true") {
                        console.log("Socket.io: Statistics Sent (race_data)")
                    }
                }
            });
        }
    });
}

//Get entries data and send
function getEntryData() {
    entry.find({}, function (err, listed_entries) {
        if (err) {
            console.log("Socket.io: Retrieve failed: " + err);
            io.emit('error', err);
        } else {
            io.emit('entry_data', listed_entries);
            if (debug_mode === "true") {
                console.log("Socket.io: Entries Sent (entry_data)")
            }
        }
    });
}

//Update sockets with statistics
exports.updateSockets = function (source) {
    getStatistics();
    getEntryData();
    console.log("Socket.io: Source: " + source + " | Data to be updated to client...");
};

//Update sockets with events
exports.sendEvent = function (sent_category, sent_desc, sent_time) {
    if (debug_mode === "true") {
        console.log("Socket.io: Event Sent (new_event)");
    }
    io.emit('new_event', {
        category: sent_category,
        desc: sent_desc,
        time: sent_time
    })
};
