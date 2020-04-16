/*\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\
App/Filename : rratfr-manager/resolvers/socketResolver.js
Author       : RAk3rman
\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\*/
let entry = require('../models/entryModel.js');
let vote = require('../models/voteModel.js');
let varSet = require('../models/varModel.js');
let event = require('../models/eventsModel.js');
let dataStore = require('data-store');
let storage = new dataStore({path: './config/sysConfig.json'});
let debug_mode = storage.get('debug_mode');
let io;
let userconnect = 0;

//Socket.io on connection
exports.socket_config = function (server) {
    io = require('socket.io')(server);
    io.on('connection', function (socket) {
        console.log('Socket.io: User Connected');
        userconnect = io.engine.clientsCount;
        getStatistics(socket.id);
        getEntryData(socket.id);
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
                    if (details[0]["timing_status"] === "in_queue") {
                        console.log("Socket.io: Bib #" + bib_number + " - Ready to Start");
                        socket.emit('check_bib_result', {
                            result: 'start_ready',
                            entry_name: details[0]["entry_name"],
                            category: details[0]["category"],
                            check_status: details[0]["check_status"]
                        });
                    }
                    if (details[0]["timing_status"] === "en_route") {
                        console.log("Socket.io: Bib #" + bib_number + " - Ready to Finish");
                        socket.emit('check_bib_result', {
                            result: 'finish_ready',
                            entry_name: details[0]["entry_name"],
                            category: details[0]["category"],
                            check_status: details[0]["check_status"]
                        });
                    }
                    if (details[0]["timing_status"] === "finished") {
                        console.log("Socket.io: Bib #" + bib_number + " - Finished");
                        socket.emit('check_bib_result', {
                            result: 'finished',
                            entry_name: details[0]["entry_name"],
                            category: details[0]["category"],
                            check_status: details[0]["check_status"]
                        });
                    }
                    if (details[0]["timing_status"] === "dq") {
                        console.log("Socket.io: Bib #" + bib_number + " - DQ");
                        socket.emit('check_bib_result', {
                            result: 'dq',
                            entry_name: details[0]["entry_name"],
                            category: details[0]["category"],
                            check_status: details[0]["check_status"]
                        });
                    }
                }
            });
        });
        socket.on('disconnect', function () {
            console.log('Socket.io: User Disconnected');
            userconnect = io.engine.clientsCount;
        });
    });
};

//Get Statistics and send
function getStatistics(socketid) {
    let total_entries_count = 0;
    let entries_in_queue_count = 0;
    let entries_in_water_count = 0;
    let entries_finished_count = 0;
    let votes_cast = 0;
    let updated_time_total_entries;
    let updated_time_in_queue;
    let updated_time_entries_in_water;
    let updated_time_entries_finished;
    let race_start_time;
    let voting_end_time;
    let voting_results_time;
    vote.find({}, function (err, listed_votes) {
        if (err) {
            console.log("Socket.io: Retrieve failed: " + err);
            io.emit('error', err);
        } else {
            for (let i in listed_votes) {
                votes_cast += 1;
            }
        }
    });
    entry.find({}, function (err, listed_entries) {
        if (err) {
            console.log("Socket.io: Retrieve failed: " + err);
            io.emit('error', err);
        } else {
            for (let i in listed_entries) {
                if (listed_entries[i]["timing_status"] === "in_queue") {
                    entries_in_queue_count += 1;
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
                            updated_time_total_entries = variables[i]["var_date"];
                        } else if (variables[i]["var_name"] === "updated_time_in_queue") {
                            updated_time_in_queue = variables[i]["var_date"];
                        } else if (variables[i]["var_name"] === "updated_time_entries_in_water") {
                            updated_time_entries_in_water = variables[i]["var_date"];
                        } else if (variables[i]["var_name"] === "updated_time_entries_finished") {
                            updated_time_entries_finished = variables[i]["var_date"];
                        } else if (variables[i]["var_name"] === "race_start_time") {
                            race_start_time = variables[i]["var_date"];
                        } else if (variables[i]["var_name"] === "voting_end_time") {
                            voting_end_time = variables[i]["var_date"];
                        } else if (variables[i]["var_name"] === "voting_results_time") {
                            voting_results_time = variables[i]["var_date"];
                        }
                    }
                    console.log(socketid);
                    if (socketid === undefined) {
                        io.emit('race_data', {
                            total_entries: total_entries_count,
                            entries_in_queue: entries_in_queue_count,
                            entries_in_water: entries_in_water_count,
                            entries_finished: entries_finished_count,
                            updated_total_entries: updated_time_total_entries,
                            updated_time_in_queue: updated_time_in_queue,
                            updated_entries_in_water: updated_time_entries_in_water,
                            updated_entries_finished: updated_time_entries_finished,
                            connected_users: userconnect,
                            race_start_time: race_start_time,
                            voting_end_time: voting_end_time,
                            voting_results_time: voting_results_time,
                            votes_cast: votes_cast
                        });
                    } else {
                        io.to(socketid).emit('race_data', {
                            total_entries: total_entries_count,
                            entries_in_queue: entries_in_queue_count,
                            entries_in_water: entries_in_water_count,
                            entries_finished: entries_finished_count,
                            updated_total_entries: updated_time_total_entries,
                            updated_time_in_queue: updated_time_in_queue,
                            updated_entries_in_water: updated_time_entries_in_water,
                            updated_entries_finished: updated_time_entries_finished,
                            connected_users: userconnect,
                            race_start_time: race_start_time,
                            voting_end_time: voting_end_time,
                            voting_results_time: voting_results_time,
                            votes_cast: votes_cast
                        });
                    }
                    if (debug_mode === "true") {
                        console.log("Socket.io: Statistics Sent (race_data)")
                    }
                }
            });
        }
    });
}

//Get entry data and send
function getEntryData(socketid) {
    entry.find({}, function (err, listed_entries) {
        if (err) {
            console.log("Socket.io: Retrieve failed: " + err);
            io.emit('error', err);
        } else {
            if (socketid === undefined) {
                io.emit('entry_data', listed_entries);
            } else {
                let public_entry_data = '[]';
                for (let i in listed_entries) {
                    let obj = JSON.parse(public_entry_data);
                    obj.push({
                        bib_number: listed_entries[i]["bib_number"],
                        entry_name: listed_entries[i]["entry_name"],
                        category: listed_entries[i]["category"],
                        timing_status: listed_entries[i]["timing_status"],
                        final_place: listed_entries[i]["final_place"],
                        final_time: listed_entries[i]["final_time"],
                        start_time: listed_entries[i]["start_time"],
                        end_time: listed_entries[i]["end_time"],
                        vote_count: listed_entries[i]["vote_count"]
                    });
                    public_entry_data = JSON.stringify(obj);
                }
                io.to(socketid).emit('entry_data', JSON.parse(public_entry_data));
            }
            if (debug_mode === "true") {
                console.log("Socket.io: Entries Sent (entry_data)");
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
