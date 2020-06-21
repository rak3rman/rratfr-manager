/*\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\
App/Filename : rratfr-manager/resolvers/entryResolver.js
Author       : RAk3rman
\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\*/
let entry = require('../models/entryModel.js');
let vote = require('../models/voteModel.js');
let varSet = require('../models/varModel.js');
let dataStore = require('data-store');
let storage = new dataStore({path: './config/sysConfig.json'});
let debug_mode = storage.get('debug_mode');
let socket = require('../resolvers/socketResolver.js');
let events = require('../resolvers/eventResolver.js');
let Jimp = require('jimp');
let formidable = require('formidable');
let fs = require('fs');

//Create a new entry
exports.create_entry = function (req, res) {
    entry.find({bib_number: req.query.bib_number}, function (err, details) {
        if (err) {
            console.log("ENTRY Resolver: Retrieve failed: " + err);
            res.status(500).send('500 Error');
        } else if (details.length === 0) {
            let newEntry = new entry({
                bib_number: req.query.bib_number,
                entry_name: req.query.entry_name,
                category: req.query.category
            });
            console.log('ENTRY Resolver: Saving Image');
            console.log(req.body, req.files);
            let form = new formidable.IncomingForm();
            form.parse(req, function(err, fields, files) {
                console.log(files);
            });
            form.on('end', function(fields, files) {
                /* Temporary location of our uploaded file */
                let temp_path = this.openedFiles[0].path;
                Jimp.read(temp_path, (err, image) => {
                    if (err) throw err;
                    image
                        .resize(Jimp.AUTO, 500)
                        .write('./static/img/entries/entry_' + req.query.bib_number + '.jpg')
                });
            });
            newEntry.save(function (err, created_entry) {
                if (err) {
                    console.log("ENTRY Resolver: Save failed: " + err);
                    res.send(err);
                } else {
                    if (debug_mode === "true") {
                        console.log('ENTRY Resolver: Entry Created: ' + JSON.stringify(created_entry))
                    }
                    socket.updateSockets("create_entry");
                    var_Updater('updated_time_total_entries', Date.now(), null);
                    var_Updater('updated_time_in_queue', Date.now(), null);
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
// exports.entry_details = function (req, res) {
//     entry.find({bib_number: req.query.bib_number}, function (err, details) {
//         if (err) {
//             console.log("ENTRY Resolver: Retrieve failed: " + err);
//             res.send(err);
//         } else {
//             if (debug_mode === "true") {
//                 console.log("ENTRY Resolver: Entry Sent: " + JSON.stringify(details))
//             }
//         }
//         res.json(details);
//     });
// };

//List all entries in database
// exports.entry_details_all = function (req, res) {
//     entry.find({}, function (err, listed_entries) {
//         if (err) {
//             console.log("ENTRY Resolver: Retrieve failed: " + err);
//             res.send(err);
//         } else {
//             if (debug_mode === "true") {
//                 console.log("ENTRY Resolver: Entries Sent: " + JSON.stringify(listed_entries))
//             }
//         }
//         res.json(listed_entries);
//     });
// };

//Edit an existing entry
exports.entry_edit = function (req, res) {
    entry.find({bib_number: req.body["bib_number"]}, function (err, newdetails) {
        console.log(newdetails);
        if (err) {
            console.log("ENTRY Resolver: Retrieve failed: " + err);
            res.status(500).send('500 Error');
        } else if (newdetails.length === 0 || req.body["bib_number"] === req.body["old_bib_number"]) {
            entry.find({bib_number: req.body["old_bib_number"]}, function (err, details) {
                console.log(details);
                if (err) {
                    console.log("ENTRY Resolver: Retrieve failed: " + err);
                    res.status(500).send('500 Error');
                } else {
                    entry.findOneAndUpdate({bib_number: req.body["old_bib_number"]}, {$set: req.body}, function (err, updatedEntry) {
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
        } else {
            console.log("ENTRY Resolver: ERROR Bib # Already Exists");
            res.status(400).send('Bib # Already Exists');
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
            var_Updater('updated_time_total_entries', Date.now(), null);
            var_Updater('updated_time_entries_in_water', Date.now(), null);
            var_Updater('updated_time_entries_finished', Date.now(), null);
            fs.unlink('./static/img/entries/entry_' + req.body["bib_number"] + '.jpg', (err) => {
                if (err) {
                    console.log("ENTRY Resolver: Problem deleting image associated: " + err);
                }
            });
            events.save_event('Entries', 'Deleted entry - Bib #' + req.body["bib_number"]);
        }
    });
};

//Update the timing status of an entry
exports.entry_timing_update = function (req, res) {
    if (req.body["status"] === "checked") {
        entry.find({bib_number: req.body["bib_number"]}, function (err, newdetails) {
            console.log(newdetails);
            if (err) {
                console.log("ENTRY Resolver: Retrieve failed: " + err);
                res.status(500).send('500 Error');
            } else if (newdetails.length === 0 || req.body["bib_number"] === req.body["old_bib_number"]) {
                entry.findOneAndUpdate({bib_number: req.body["old_bib_number"]}, {
                    $set: {
                        check_status: 'CHECKED',
                        final_time: 'NT - IN QUEUE',
                        bib_number: req.body["bib_number"],
                        entry_name: req.body["entry_name"],
                        category: req.body["category"],
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
                        events.save_event('Timing', data.entry_name + ' - Bib #' + req.body["bib_number"] + ' has passed the Entry Check');
                        socket.updateSockets("update_check");
                    }
                });
            } else {
                console.log("ENTRY Resolver: ERROR Bib # Already Exists");
                res.status(400).send('Bib # Already Exists');
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
                var_Updater('updated_time_entries_in_water', Date.now(), null);
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
                var_Updater('updated_time_entries_finished', Date.now(), null);
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
                timing_status: 'in_queue',
                final_place: 'NT',
                final_time: 'NT - IN QUEUE',
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
                var_Updater('updated_time_in_queue', Date.now(), null);
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

//Manual request to sort all entries
exports.entry_sort = function (req, res) {
    sortEntries();
    res.status(200).send('success');
};

//Return results of individual contests
exports.return_results = function (req, res) {
    let pc_winner = "Not Released";
    let jc_winner = "Not Released";
    let cd1_winner = "Not Released";
    let cd2_winner = "Not Released";
    let cd3_winner = "Not Released";
    varSet.find({}, function (err, variables) {
        if (err) {
            console.log("Socket.io: Retrieve failed: " + err);
            io.emit('error', err);
        } else {
            entry.find({}, function (err, listed_entries) {
                if (err) {
                    console.log("ENTRY Resolver: Retrieve failed: " + err);
                } else {
                    //Parse for JC
                    for (let j in variables) {
                        if (variables[j]["var_name"] === "judges_choice") {
                            for (let i in listed_entries) {
                                if (listed_entries[i]["bib_number"] === variables[j]["var_value"]) {
                                    jc_winner = "<strong>" + listed_entries[i]["entry_name"] + "</strong> #" + listed_entries[i]["bib_number"];
                                }
                            }
                        }
                    }
                    //Pre-sort entries based on votes for PC
                    listed_entries.sort(function (a, b) {
                        return parseFloat(b.vote_count) - parseFloat(a.vote_count);
                    });
                    pc_winner = "Not Posted";
                    if (listed_entries[0]) {
                        if (listed_entries[0]["vote_count"] !== 0) {
                            pc_winner = "<strong>" + listed_entries[0]["entry_name"] + "</strong> #" + listed_entries[0]["bib_number"];
                        }
                    }
                    res.json({
                        pc_winner: pc_winner,
                        jc_winner: jc_winner,
                        cd1_winner: cd1_winner,
                        cd2_winner: cd2_winner,
                        cd3_winner: cd3_winner
                    });
                }
            });
        }
    });
};

//Submit Vote Logic
exports.submit_vote = function (req, res) {
    vote.find({user_ip: req.body.user_ip}, function (err, details) {
        if (err) {
            console.log("VOTE Resolver: Retrieve failed: " + err);
            res.status(500).send('500 Error');
        } else if (details.length === 0) {
            let newVote = new vote({
                bib_number: req.body.bib_number,
                user_ip: req.body.user_ip,
                user_data: JSON.stringify(req.body.user_data)
            });
            newVote.save(function (err, created_vote) {
                if (err) {
                    console.log("VOTE Resolver: Save failed: " + err);
                    res.send(err);
                } else {
                    //Vote is now stored, update vote_count of entry
                    if (debug_mode === "true") {
                        console.log('VOTE Resolver: Vote Created: ' + JSON.stringify(created_vote))
                    }
                    events.save_event('Voting', 'Noted new vote from IP: ' + req.body.user_ip + ' for Bib #: ' + req.body.bib_number);
                    entry.find({bib_number: req.body.bib_number}, function (err, details) {
                        if (err) {
                            console.log("ENTRY Resolver: Retrieve failed: " + err);
                            res.status(500).send('500 Error');
                        } else {
                            entry.findOneAndUpdate({bib_number: req.body.bib_number}, {$set: {vote_count: (details[0].vote_count + 1)}}, function (err, updatedEntry) {
                                if (err) {
                                    console.log("ENTRY Resolver: Update failed: " + err);
                                    res.send(err);
                                } else {
                                    console.log("ENTRY Resolver: Entry Updated: " + updatedEntry);
                                    res.status(200).send('success');
                                    socket.updateSockets("entry_edit");
                                    events.save_event('Entries', 'Updated entry ' + updatedEntry.entry_name + ' - Bib #' + updatedEntry.bib_number);
                                }
                            });
                        }
                    })
                }
            });
        } else {
            console.log("VOTE Resolver: ERROR IP Already Voted");
            res.status(403).send('User Already Voted');
        }
    });
};

//List all votes in database
exports.return_all_votes = function (req, res) {
    vote.find({}, function (err, listed_votes) {
        if (err) {
            console.log("VOTE Resolver: Retrieve failed: " + err);
            res.send(err);
        } else {
            if (debug_mode === "true") {
                console.log("VOTE Resolver: Votes Sent: " + JSON.stringify(listed_votes))
            }
            res.json(listed_votes);
        }
    });
};

//Re-tabulate votes
exports.re_tabulate_votes = function (req, res) {
    vote.find({}, function (err, listed_votes) {
        if (err) {
            console.log("VOTE Resolver: Retrieve failed: " + err);
            res.send(err);
        } else {
            for (let i in listed_votes) {
                entry.find({bib_number: listed_votes[i]["bib_number"]}, function (err, details) {
                    if (err) {
                        console.log("ENTRY Resolver: Retrieve failed: " + err);
                        console.log("VOTE Resolver: Error in matching entry to vote. Continuing anyway...");
                    } else {
                        entry.findOneAndUpdate({bib_number: listed_votes[i]["bib_number"]}, {$set: {vote_count: (details[0].vote_count + 1)}}, function (err, updatedEntry) {
                            if (err) {
                                console.log("ENTRY Resolver: Update failed: " + err);
                                res.send(err);
                            } else {
                                console.log("ENTRY Resolver: Entry Updated: " + updatedEntry);
                                res.status(200).send('success');
                                socket.updateSockets("entry_edit");
                                events.save_event('Entries', 'Updated entry ' + updatedEntry.entry_name + ' - Bib #' + updatedEntry.bib_number);
                            }
                        });
                    }
                })
            }
        }
    });
};

//Select Judges Choice Award
exports.select_judges_choice = function (req, res) {
    entry.find({ bib_number: req.body["bib_number"] }, function (err, data) {
        if (err) {
            console.log("ENTRY Resolver: Retrieve failed: " + err);
            res.send(err);
        } else {
            var_Updater("judges_choice", null, req.body["bib_number"]);
            res.status(200).send('success');
            events.save_event('Voting', 'Assigned Judges Choice Award to ' + data[0].entry_name + ' | Bib #: ' + data[0].bib_number);
            //Delay to wait for DB to update
            setTimeout(function(){
                socket.updateSockets("select_judges_choice");
            }, 300);
        }
    });
};

//Reset Judges Choice Award
exports.reset_judges_choice = function (req, res) {
    var_Updater("judges_choice", null, null);
    res.status(200).send('success');
    events.save_event('Voting', 'Reset Judges Choice Award assignment');
    //Delay to wait for DB to update
    setTimeout(function(){
        socket.updateSockets("reset_judges_choice");
    }, 300);
};

//Get Settings Data
exports.settings_get = function (req, res) {
    varSet.find({}, function (err, variables) {
        if (err) {
            console.log("Socket.io: Retrieve failed: " + err);
            io.emit('error', err);
        } else {
            let race_start_time;
            let voting_end_time;
            let voting_results_time;
            for (let i in variables) {
                if (variables[i]["var_name"] === "race_start_time") {
                    race_start_time = variables[i]["var_date"];
                }
                if (variables[i]["var_name"] === "voting_end_time") {
                    voting_end_time = variables[i]["var_date"];
                }
                if (variables[i]["var_name"] === "voting_results_time") {
                    voting_results_time = variables[i]["var_date"];
                }
            }
            res.json({
                race_start_time: race_start_time,
                voting_end_time: voting_end_time,
                voting_results_time: voting_results_time,
                console_port: storage.get('console_port'),
                mongodb_url: storage.get('mongodb_url'),
                passport_auth0_baseURL: storage.get('passport_auth0_baseURL'),
                passport_auth0_clientID: storage.get('passport_auth0_clientID'),
                passport_auth0_issuerURL: storage.get('passport_auth0_issuerURL'),
                signup_mode: storage.get('signup_mode'),
                debug_mode: storage.get('debug_mode'),
                passport_auth0: storage.get('passport_auth0'),
                production: storage.get('production'),
                awaiting_date: storage.get('awaiting_date')
            });
            if (debug_mode === "true") {
                console.log("SETTINGS Resolver: Current settings sent")
            }
        }
    });
};

//Update Settings Data
exports.settings_update = function (req, res) {
    var_Updater("race_start_time", req.body["race_start_time"], null);
    var_Updater("voting_end_time", req.body["voting_end_time"], null);
    var_Updater("voting_results_time", req.body["voting_results_time"], null);
    if (storage.get('mongodb_url') !== req.body["mongodb_url"]) {
        console.log("SETTINGS Resolver: Restarting due to mongodb_url");
        storage.set('mongodb_url', req.body["mongodb_url"]);
    }
    if (storage.get('console_port') !== req.body["console_port"]) {
        console.log("SETTINGS Resolver: Restarting due to console_port");
        storage.set('console_port', req.body["console_port"]);
    }
    if (storage.get('passport_auth0_baseURL') !== req.body["passport_auth0_baseURL"]) {
        console.log("SETTINGS Resolver: Restarting due to passport_auth0_baseURL");
        storage.set('passport_auth0_baseURL', req.body["passport_auth0_baseURL"]);
    }
    if (storage.get('passport_auth0_clientID') !== req.body["passport_auth0_clientID"]) {
        console.log("SETTINGS Resolver: Restarting due to passport_auth0_clientID");
        storage.set('passport_auth0_clientID', req.body["passport_auth0_clientID"]);
    }
    if (storage.get('passport_auth0_issuerURL') !== req.body["passport_auth0_issuerURL"]) {
        console.log("SETTINGS Resolver: Restarting due to passport_auth0_issuerURL");
        storage.set('passport_auth0_issuerURL', req.body["passport_auth0_issuerURL"]);
    }
    if (storage.get('signup_mode') !== req.body["signup_mode"]) {
        console.log("SETTINGS Resolver: Restarting due to signup_mode");
        storage.set('signup_mode', req.body["signup_mode"]);
    }
    if (storage.get('debug_mode') !== req.body["debug_mode"]) {
        console.log("SETTINGS Resolver: Restarting due to debug_mode");
        storage.set('debug_mode', req.body["debug_mode"]);
    }
    if (storage.get('passport_auth0') !== req.body["passport_auth0"]) {
        console.log("SETTINGS Resolver: Restarting due to passport_auth0");
        storage.set('passport_auth0', req.body["passport_auth0"]);
    }
    if (storage.get('production') !== req.body["production"]) {
        console.log("SETTINGS Resolver: Restarting due to production");
        storage.set('production', req.body["production"]);
    }
    if (storage.get('awaiting_date') !== req.body["awaiting_date"]) {
        console.log("SETTINGS Resolver: Restarting due to awaiting_date");
        storage.set('awaiting_date', req.body["awaiting_date"]);
    }
    events.save_event('System', 'Saved new system and race settings');
    socket.updateSockets("settings_update");
    res.status(200).send('success');
    if (debug_mode === "true") {
        console.log("SETTINGS Resolver: Saved new settings as" + JSON.stringify(req.body))
    }
};

//Update Variables to DB
function var_Updater(var_name, var_date, var_value) {
    varSet.findOneAndUpdate({ var_name: var_name }, { $set: { var_date: var_date, var_value: var_value }}, function (err, data) {
        if (err) {
            console.log("VAR Resolver: Retrieve failed: " + err);
        }
        if (data == null) {
            let newVar = new varSet({ var_name: var_name, var_date: var_date, var_value: var_value });
            newVar.save(function (err, created_var) {
                if (err) {
                    console.log("VAR Resolver: Save failed: " + err);
                } else {
                    if (debug_mode === "true") { console.log('VAR Resolver: VAR Created: ' + JSON.stringify(created_var)) }
                }
            });
        } else {
            if (debug_mode === "true") {
                console.log("VAR Resolver: (" + var_name + ") updated to value (DATE): " + var_date + " (VALUE): " + var_value)
            }
        }
    });
}