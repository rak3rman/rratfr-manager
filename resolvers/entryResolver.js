/*\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\
App/Filename : rratfr-manager/resolvers/entryResolver.js
Author       : RAk3rman
\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\*/
let entry = require('../models/entryModel.js');
let dataStore = require('data-store');
let storage = new dataStore({path: './config/sysConfig.json'});
let debug_mode = storage.get('debug_mode');

//Create a new entry
exports.create_entry = function (req, res) {
    let newEntry = new entry(req.body);
    newEntry.save(function (err, created_entry) {
        if (err) {
            console.log("ENTRY Resolver: Save failed: " + err);
            res.send(err);
        } else {
            if (debug_mode === "true") {
                console.log('ENTRY Resolver: Entry Created: ' + JSON.stringify(created_entry))
            }
        }
        res.json(created_entry);
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

//Update the timing status of an entry
exports.entry_timing_update = function (req, res) {
    if (req.body["status"] === "start") {
        entry.findOneAndUpdate({bib_number: req.body["bib_number"]}, {
            $set: {
                timing_status: 'en_route',
                start_time: Date.now()
            }
        }, function (err, data) {
            if (err || data == null) {
                console.log("ENTRY Resolver: Retrieve failed: " + err);
                res.status(500).send('error');
            } else {
                console.log("ENTRY Resolver: Entry Status Updated: " + data);
                res.json(data);
            }
        });
    } else if (req.body["status"] === "finish") {
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
                console.log("ENTRY Resolver: Entry Status Updated: " + data);
                res.json(data);
                calcTime(req.body["bib_number"]);
            }
        });
    } else if (req.body["status"] === "dq") {
        entry.findOneAndUpdate({bib_number: req.body["bib_number"]}, {$set: {timing_status: 'dq'}}, function (err, data) {
            if (err || data == null) {
                console.log("ENTRY Resolver: Retrieve failed: " + err);
                res.status(500).send('error');
            } else {
                console.log("ENTRY Resolver: Entry Status Updated: " + data);
                res.json(data);
            }
        });
    }
};

//Calculate the final time after finish and publish
function calcTime(bib_number) {
    entry.find({bib_number: bib_number}, function (err, details) {
        if (err) {
            console.log("ENTRY Resolver: Retrieve failed: " + err);
        } else {
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
            console.log(bib_number + " - Final Time Difference: " + final_time);
            entry.findOneAndUpdate({bib_number: bib_number}, {$set: {final_time: final_time, raw_final_time: raw_final_time}}, function (err, data) {
                if (err || data == null) {
                    console.log("ENTRY Resolver: Retrieve failed: " + err);
                } else {
                    console.log("ENTRY Resolver: Entry Status Updated: " + data);
                    entry.find({}, function (err, listed_entries) {
                        if (err) {
                            console.log("ENTRY Resolver: Retrieve failed: " + err);
                        } else {
                            listed_entries.sort(function(a, b) {
                                return parseFloat(a.raw_final_time) - parseFloat(b.raw_final_time);
                            });
                            console.log(listed_entries);
                            let setPlace = 1;
                            for (let i in listed_entries) {
                                entry.findOneAndUpdate({bib_number: listed_entries[i]["bib_number"]}, {$set: {final_place: setPlace}}, function (err, data) {
                                    if (err || data == null) {
                                        console.log("ENTRY Resolver: Retrieve failed: " + err);
                                    } else {
                                        console.log("ENTRY Resolver: Entry Status Updated: " + data);
                                    }
                                });
                                setPlace += 1;
                            }
                        }
                    });
                }
            });
        }
    });
}

// //Give details about the node requested
// exports.node_details = function (req, res) {
//     console.log(req.query.node_id);
//     node.find({ node_id: req.query.node_id }, function (err, details) {
//         if (err) {
//             console.log("NODE Resolver: Retrieve failed: " + err);
//             res.send(err);
//         } else {
//             if (debug_mode === "true") { console.log("NODE Resolver: Nodes Sent: " + JSON.stringify(details)) }
//         }
//         res.json(details);
//     });
// };

//Edit an existing node
// exports.node_edit = function (req, res) {
//     node.findOneAndUpdate({ node_id: req.body["node_id"] }, { $set: req.body }, function (err, updatedNode) {
//         if (err) {
//             console.log("NODE Resolver: Update failed: " + err);
//             res.send(err);
//         } else {
//             console.log("NODE Resolver: Node Updated: " + updatedNode);
//             res.json(updatedNode);
//         }
//     });
// };

//Set the status of a node to hidden
// exports.hide_node = function (req, res) {
//     node.findOneAndUpdate({ node_id: req.body["node_id"] }, { $set: { node_status: 'hidden' }}, function (err, data) {
//         if (err || data == null) {
//             console.log("NODE Resolver: Retrieve failed: " + err);
//             res.status(500).send('error');
//         } else {
//             console.log("NODE Resolver: Node Status Updated: " + data);
//             res.json(data);
//         }
//     });
// };