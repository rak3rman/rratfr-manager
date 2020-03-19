/*\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\
RRATFR Manager Front-End JS - Authored by: RAk3rman
\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\*/
//Declare socket.io
let socket = io();
//Set SA Toast Settings
const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 5000
});
let racestart = 0;

//Set Table Settings
let tableSettings = {
    "lengthMenu": [
        [10, 25, 50, -1],
        [10, 25, 50, "All"]
    ],
    "responsive": true,
    "order": [[ 2, "asc" ]],
    "columnDefs": [
        { "orderable": false, "targets": 0 }
    ],
};
let votetableSettings = {
    "lengthMenu": [
        [10, 25, 50, -1],
        [10, 25, 50, "All"]
    ],
    "responsive": true,
    "order": [[ 0, "desc" ]],
    "columnDefs": [
        { "orderable": false, "targets": 0 }
    ],
};
let eventtableSettings = {
    "lengthMenu": [
        [10, 25, 50, -1],
        [10, 25, 50, "All"]
    ],
    "responsive": true,
    "order": [[ 2, "desc" ]],
    "language": {
        "emptyTable": "Events will load as they occur..."
    },
};
let leaderTable = $('#leaderTable').DataTable(tableSettings);
let voteTable = $('#voteTable').DataTable(votetableSettings);
let eventsAllTable = $('#eventsAllTable').DataTable(eventtableSettings);
let eventsEntriesTable = $('#eventsEntriesTable').DataTable(eventtableSettings);
let eventsTimingTable = $('#eventsTimingTable').DataTable(eventtableSettings);
let eventsVotingTable = $('#eventsVotingTable').DataTable(eventtableSettings);
$('a[data-toggle="tab"]').on( 'shown.bs.tab', function (e) {
    $.fn.dataTable.tables( {visible: true, api: true} ).columns.adjust();
} );

//Socket.io handle Statistics
socket.on('race_data', function(data){
    document.getElementById("totalStat").innerHTML = data.total_entries;
    document.getElementById("queueStat").innerHTML = data.entries_in_queue;
    document.getElementById("inwaterStat").innerHTML = data.entries_in_water;
    document.getElementById("finishStat").innerHTML = data.entries_finished;
    document.getElementById("connected_users").innerHTML = data.connected_users;
    document.getElementById("pushedDate1").innerHTML = 'Updated ' + moment(data.updated_total_entries).fromNow();
    document.getElementById("pushedDate2").innerHTML = 'Updated ' + moment(data.updated_time_in_queue).fromNow();
    document.getElementById("pushedDate3").innerHTML = 'Updated ' + moment(data.updated_entries_in_water).fromNow();
    document.getElementById("pushedDate4").innerHTML = 'Updated ' + moment(data.updated_entries_finished).fromNow();
    racestart = moment(data.race_start_time).format("x");
    document.getElementById("votes_cast").innerHTML = data.votes_cast;
});

//Socket.io handle Leaderboard Data
socket.on('entry_data', function (data) {
    leaderTable.clear();
    voteTable.clear();
    $.each(data, function (i, value) {
        let final_place_text = value.final_place;
        if (value.final_place === "1") {
            final_place_text = "<strong><a style='color:#D4AF37'>" + value.final_place + "</a></strong>";
        }
        if (value.final_place === "2") {
            final_place_text = "<strong><a style='color:#C4CACE'>" + value.final_place + "</a></strong>";
        }
        if (value.final_place === "3") {
            final_place_text = "<strong><a style='color:#CD7F32'>" + value.final_place + "</a></strong>";
        }
        let detailed_name = "<div href=\"/static/img/entries/entry_" + value.bib_number + ".jpg\" class=\"lightitem\" title=\"" + value.entry_name + " | #" + value.bib_number + " " + value.category + "\">" + value.entry_name + " <span class='text-gray'>#" + value.bib_number + "</span></div>";
        leaderTable.row.add([final_place_text, detailed_name, value.final_time, value.category]);
        voteTable.row.add([ value.vote_count, detailed_name, value.category]);
    });
    leaderTable.draw();
    voteTable.draw();
    $(window).trigger('resize');
    lightGallery(document.getElementById('lightgallery1'), {
        selector: '.lightitem'
    });
    lightGallery(document.getElementById('lightgallery2'), {
        selector: '.lightitem'
    });
});

//Socket.io handle Events
socket.on('new_event', function(data){
    if (data.category === "Entries") {
        let category = "<i class=\"fas fa-copy\"></i> <strong>" + data.category + "</strong>";
        eventsAllTable.row.add([category, data.desc, moment(data.date).format('MM/DD/YY, h:mm:ss a')]);
        eventsEntriesTable.row.add([category, data.desc, moment(data.date).format('MM/DD/YY, h:mm:ss a')]);
        eventsEntriesTable.draw();
    }
    if (data.category === "Timing") {
        let category = "<i class=\"fas fa-stopwatch\"></i> <strong>" + data.category + "</strong>";
        eventsAllTable.row.add([category, data.desc, moment(data.date).format('MM/DD/YY, h:mm:ss a')]);
        eventsTimingTable.row.add([category, data.desc, moment(data.date).format('MM/DD/YY, h:mm:ss a')]);
        eventsTimingTable.draw();
    }
    if (data.category === "Voting") {
        let category = "<i class=\"fas fa-vote-yea\"></i> <strong>" + data.category + "</strong>";
        eventsAllTable.row.add([category, data.desc, moment(data.date).format('MM/DD/YY, h:mm:ss a')]);
        eventsVotingTable.row.add([category, data.desc, moment(data.date).format('MM/DD/YY, h:mm:ss a')]);
        eventsVotingTable.draw();
    }
    eventsAllTable.draw();
    $(window).trigger('resize');
});

//Master Clock Logic
setInterval(setClock, 100);
function setClock() {
    let posneg = "T-";
    if (Math.sign(Date.now() - racestart) === 1) {
        posneg = "T+";
    }
    let duration = moment.duration(Math.abs(Date.now() - racestart), 'milliseconds');
    document.getElementById("masterclock").innerHTML = posneg + Math.round(duration.asHours()) + ":" + duration.minutes() + ":" + duration.seconds() + "." + duration.milliseconds().toString().slice(0,1)
}

//Socket.io Error
socket.on('error', function(data){
    Toast.fire({
        type: 'info',
        title: 'Please refresh page'
    });
});
