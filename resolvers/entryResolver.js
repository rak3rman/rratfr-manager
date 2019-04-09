/*\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\
App/Filename : rratfr-manager/resolvers/entryResolver.js
Author       : RAk3rman
\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\*/
let entry = require('../models/entryModel.js');
let dataStore = require('data-store');
let storage = new dataStore({path: './config/sysConfig.json'});
let debug_mode = storage.get('debug_mode');
let socket = require('../resolvers/socketResolver.js');
let events = require('../resolvers/eventResolver.js');

//Create a new entry
exports.create_entry = function (req, res) {
    entry.find({bib_number: req.body["bib_number"]}, function (err, details) {
        console.log(details);
        if (err) {
            console.log("ENTRY Resolver: Retrieve failed: " + err);
            res.status(500).send('500 Error');
        } else if (details.length === 0) {
            let newEntry = new entry(req.body);
            newEntry.save(function (err, created_entry) {
                if (err) {
                    console.log("ENTRY Resolver: Save failed: " + err);
                    res.send(err);
                } else {
                    if (debug_mode === "true") {
                        console.log('ENTRY Resolver: Entry Created: ' + JSON.stringify(created_entry))
                    }
                    socket.updateSockets("create_entry");
                    var_Updater('updated_time_total_entries', Date.now());
                    events.save_event('Entries', 'Created new entry ' + created_entry.entry_name + ' - Bib #' + created_entry.bib_number)
                }
                res.json(created_entry);
            });
        } else {
            console.log("ENTRY Resolver: ERROR Bib # Already Exists");
            res.status(400).send('Bib # Already Exists');
        }
    });
};

//Give details about the entry requested
exports.entry_details = function (req, res) {
    entry.find({bib_number: req.query.bib_number}, function (err, details) {
        if (err) {
            console.log("ENTRY Resolver: Retrieve failed: " + err);
            res.send(err);
        } else {
            if (debug_mode === "true") {
                console.log("ENTRY Resolver: Entry Sent: " + JSON.stringify(details))
            }
        }
        res.json(details);
    });
};

//List all entries in database
exports.entry_details_all = function (req, res) {
    entry.find({}, function (err, listed_entries) {
        if (err) {
            console.log("ENTRY Resolver: Retrieve failed: " + err);
            res.send(err);
        } else {
            if (debug_mode === "true") {
                console.log("ENTRY Resolver: Entries Sent: " + JSON.stringify(listed_entries))
            }
        }
        res.json(listed_entries);
    });
};

//Edit an existing entry
exports.entry_edit = function (req, res) {
    entry.find({bib_number: req.body["bib_number"]}, function (err, details) {
        console.log(details);
        if (err) {
            console.log("ENTRY Resolver: Retrieve failed: " + err);
            res.status(500).send('500 Error');
        } else {
            entry.findOneAndUpdate({bib_number: req.body["bib_number"]}, {$set: req.body}, function (err, updatedEntry) {
                if (err) {
                    console.log("ENTRY Resolver: Update failed: " + err);
                    res.send(err);
                } else {
                    console.log("ENTRY Resolver: Entry Updated: " + updatedEntry);
                    res.json(updatedEntry);
                    socket.updateSockets("entry_edit");
                    events.save_event('Entries', 'Updated entry ' + updatedEntry.entry_name + ' - Bib #' + updatedEntry.bib_number);
                }
            });
            if (details[0]["timing_status"] === "finished") {
                if (details[0]["start_time"] !== req.body["start_time"] || details[0]["end_time"] !== req.body["end_time"]) {
                    calcTime(req.body["bib_number"]);
                }
            }
        }
    });
};

//Delete an existing entry
exports.entry_delete = function (req, res) {
    entry.deleteOne({bib_number: req.body["bib_number"]}, function (err) {
        if (err) {
            console.log("ENTRY Resolver: Delete failed: " + err);
            res.send(err);
        } else {
            console.log("ENTRY Resolver: Entry Deleted: " + req.body["bib_number"]);
            res.json(req.body["bib_number"]);
            sortEntries();
            var_Updater('updated_time_total_entries', Date.now());
            var_Updater('updated_time_missing_safety', Date.now());
            var_Updater('updated_time_entries_in_water', Date.now());
            var_Updater('updated_time_entries_finished', Date.now());
            events.save_event('Entries', 'Deleted entry - Bib #' + req.body["bib_number"]);
        }
    });
};

//Update the timing status of an entry
exports.entry_timing_update = function (req, res) {
    if (req.body["status"] === " checked") {
        entry.findOneAndUpdate({bib_number: req.body["bib_number"]}, {
            $set: {
                check_status: 'CHECKED',
                final_time: 'NT - IN QUEUE'
            }
        }, function (err, data) {
            if (err || data == null) {
                console.log("ENTRY Resolver: Retrieve failed: " + err);
                res.status(500).send('error');
            } else {
                if (debug_mode === "true") {
                    console.log("ENTRY Resolver: Entry Status Updated: " + data);
                }
                res.json(data);
                var_Updater('updated_time_missing_safety', Date.now());
                events.save_event('Timing', data.entry_name + ' - Bib #' + req.body["bib_number"] + ' has passed the Safety Check');
                socket.updateSockets("update_safety");
            }
        });
    }
    if (req.body["status"] === "start") {
        entry.findOneAndUpdate({bib_number: req.body["bib_number"]}, {
            $set: {
                timing_status: 'en_route',
                final_time: 'NT - EN ROUTE',
                start_time: Date.now()
            }
        }, function (err, data) {
            if (err || data == null) {
                console.log("ENTRY Resolver: Retrieve failed: " + err);
                res.status(500).send('error');
            } else {
                if (debug_mode === "true") {
                    console.log("ENTRY Resolver: Entry Status Updated: " + data);
                }
                res.json(data);
                var_Updater('updated_time_entries_in_water', Date.now());
                events.save_event('Timing', data.entry_name + ' - Bib #' + req.body["bib_number"] + ' has Started');
                socket.updateSockets("update_start");
            }
        });
    }
    if (req.body["status"] === "finish") {
        entry.findOneAndUpdate({bib_number: req.body["bib_number"]}, {
            $set: {
                timing_status: 'finished',
                end_time: Date.now()
            }
        }, function (err, data) {
            if (err || data == null) {
                console.log("ENTRY Resolver: Retrieve failed: " + err);
                res.status(500).send('error');
            } else {
                if (debug_mode === "true") {
                    console.log("ENTRY Resolver: Entry Status Updated: " + data);
                }
                res.json(data);
                calcTime(req.body["bib_number"]);
                var_Updater('updated_time_entries_finished', Date.now());
                events.save_event('Timing', data.entry_name + ' - Bib #' + req.body["bib_number"] + ' has Finished');
            }
        });
    }
    if (req.body["status"] === "dq") {
        entry.findOneAndUpdate({bib_number: req.body["bib_number"]}, {
            $set: {
                timing_status: 'dq',
                final_place: 'DQ',
                final_time: 'NT - DISQUALIFIED',
                raw_final_time: '999999'
            }
        }, function (err, data) {
            if (err || data == null) {
                console.log("ENTRY Resolver: Retrieve failed: " + err);
                res.status(500).send('error');
            } else {
                if (debug_mode === "true") {
                    console.log("ENTRY Resolver: Entry Status Updated: " + data);
                }
                res.json(data);
                sortEntries();
                events.save_event('Timing', data.entry_name + ' - Bib #' + req.body["bib_number"] + ' has been Disqualified');
            }
        });
    }
    if (req.body["status"] === "reset") {
        entry.findOneAndUpdate({bib_number: req.body["bib_number"]}, {
            $set: {
                timing_status: 'waiting',
                final_place: 'NT',
                final_time: 'NT - WAITING',
                raw_final_time: '999999'
            }
        }, function (err, data) {
            if (err || data == null) {
                console.log("ENTRY Resolver: Retrieve failed: " + err);
                res.status(500).send('error');
            } else {
                if (debug_mode === "true") {
                    console.log("ENTRY Resolver: Entry Status Updated: " + data);
                }
                res.json(data);
                sortEntries();
                events.save_event('Timing', data.entry_name + ' - Bib #' + req.body["bib_number"] + ' has been Reset');
            }
        });
    }
};

//Calculate the final time after finish and publish
function calcTime(bib_number) {
    //Find the information about the raft that finished
    entry.find({bib_number: bib_number}, function (err, details) {
        if (err) {
            console.log("ENTRY Resolver: Retrieve failed: " + err);
        } else {
            //Calculate final time
            let raw_time = details[0]["end_time"] - details[0]["start_time"];
            let hh = ("0" + Math.floor(raw_time / 1000 / 60 / 60)).slice(-2);
            raw_time -= hh * 1000 * 60 * 60;
            let mm = ("0" + Math.floor(raw_time / 1000 / 60)).slice(-2);
            raw_time -= mm * 1000 * 60;
            let ss = ("0" + Math.floor(raw_time / 1000)).slice(-2);
            raw_time -= ss * 1000;
            let ms = (raw_time + "0").slice(0, 1);
            let final_time = hh + ":" + mm + ":" + ss + "." + ms;
            let raw_final_time = hh + mm + ss + ms;
            console.log("TIMING: Bib #" + bib_number + " - Final Time Difference: " + final_time);
            events.save_event('Timing', 'Calculated time for ' + details[0]["entry_name"] + ' - Bib #' + bib_number + ' is ' + final_time);
            //Find entry and update with final time
            entry.findOneAndUpdate({bib_number: bib_number}, {
                $set: {
                    final_time: final_time,
                    raw_final_time: raw_final_time
                }
            }, function (err, data) {
                if (err || data == null) {
                    console.log("ENTRY Resolver: Retrieve failed: " + err);
                } else {
                    if (debug_mode === "true") {
                        //console.log("ENTRY Resolver: Entry Status Updated: " + data);
                    }
                    sortEntries();
                }
            });
        }
    });
}

//Sort all finished entries
function sortEntries() {
    //Look through finished results and place accordingly
    entry.find({}, function (err, listed_entries) {
        if (err) {
            console.log("ENTRY Resolver: Retrieve failed: " + err);
        } else {
            //Pre-sort entries
            listed_entries.sort(function (a, b) {
                return parseFloat(a.raw_final_time) - parseFloat(b.raw_final_time);
            });
            let setPlace = 1;
            console.log("Ordered Data: " + listed_entries);
            //Set each finished result with place value
            for (let i in listed_entries) {
                if (listed_entries[i]["timing_status"] === "finished") {
                    console.log(setPlace);
                    entry.findOneAndUpdate({bib_number: listed_entries[i]["bib_number"]}, {$set: {final_place: setPlace}}, function (err, data) {
                        if (err || data == null) {
                            console.log("ENTRY Resolver: Retrieve failed: " + err);
                        } else {
                            //console.log("ENTRY Resolver: Entry Status Updated: " + data);
                        }
                    });
                    setPlace += 1;
                }
            }
            //Delay to wait for DB to update
            setTimeout(function(){
                socket.updateSockets("sort_entries");
            }, 300);
            events.save_event('Timing', 'Sorted through finished entries');
        }
    });
}

//Update Variables to DB
let varSet = require('../models/varModel.js');
function var_Updater(var_name, var_value) {
    varSet.findOneAndUpdate({ var_name: var_name }, { $set: { var_value: var_value }}, function (err, data) {
        if (err) {
            console.log("VAR Resolver: Retrieve failed: " + err);
        }
        if (data == null) {
            let newVar = new varSet({ var_name: var_name, var_value: var_value });
            newVar.save(function (err, created_var) {
                if (err) {
                    console.log("VAR Resolver: Save failed: " + err);
                } else {
                    if (debug_mode === "true") { console.log('VAR Resolver: VAR Created: ' + JSON.stringify(created_var)) }
                }
            });
        } else {
            if (debug_mode === "true") {
                console.log("VAR Resolver: (" + var_name + ") updated to value: " + var_value)
            }
        }
    });
}