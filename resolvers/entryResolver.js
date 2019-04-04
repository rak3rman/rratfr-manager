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
            if (debug_mode === "true") { console.log('ENTRY Resolver: Entry Created: ' + JSON.stringify(created_entry)) }
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
            if (debug_mode === "true") { console.log("ENTRY Resolver: Entries Sent: " + JSON.stringify(listed_entries)) }
        }
        res.json(listed_entries);
    });
};

//Get admin statistics of race
exports.get_admin_statistics = function (req, res) {
    let total_entries_count = 0;
    let missing_safety_count = 0;
    let entries_in_water_count = 0;
    let entries_finished_count = 0;
    entry.find({}, function (err, listed_entries) {
        if (err) {
            console.log("ENTRY Resolver: Retrieve failed: " + err);
            res.send(err);
        } else {
            for (let i in listed_entries) {
                if (listed_entries[i]["safety_status"] === "false") {
                    missing_safety_count += 1;
                }
                if (listed_entries[i]["start_time"] != null) {
                    entries_in_water += 1;
                }
                if (listed_entries[i]["end_time"] != null) {
                    entries_finished += 1;
                }
                total_entries_count += 1;
            }
            if (debug_mode === "true") { console.log("ENTRY Resolver: Statistics Sent.")}
        }
        res.json({
            total_entries: total_entries_count,
            missing_safety: missing_safety_count,
            entries_in_water: entries_in_water_count,
            entries_finished: entries_finished_count
        })
    });
};

//Get open statistics of race
exports.get_open_statistics = function (req, res) {
    let total_entries_count = 0;
    let entries_in_water_count = 0;
    let entries_finished_count = 0;
    entry.find({}, function (err, listed_entries) {
        if (err) {
            console.log("ENTRY Resolver: Retrieve failed: " + err);
            res.send(err);
        } else {
            for (let i in listed_entries) {
                if (listed_entries[i]["start_time"] != null) {
                    entries_in_water += 1;
                }
                if (listed_entries[i]["end_time"] != null) {
                    entries_finished += 1;
                }
                total_entries_count += 1;
            }
            if (debug_mode === "true") { console.log("ENTRY Resolver: Statistics Sent.")}
        }
        res.json({
            total_entries: total_entries_count,
            entries_in_water: entries_in_water_count,
            entries_finished: entries_finished_count
        })
    });
};

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