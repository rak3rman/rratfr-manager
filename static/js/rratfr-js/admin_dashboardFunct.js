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
let eventsAllTable = $('#eventsAllTable').DataTable(eventtableSettings);
let eventsEntriesTable = $('#eventsEntriesTable').DataTable(eventtableSettings);
let eventsTimingTable = $('#eventsTimingTable').DataTable(eventtableSettings);
$('a[data-toggle="tab"]').on( 'shown.bs.tab', function (e) {
    $.fn.dataTable.tables( {visible: true, api: true} ).columns.adjust();
} );

//Socket.io handle Statistics
socket.on('race_data', function(data){
    document.getElementById("totalStat").innerHTML = data.total_entries;
    document.getElementById("checkStat").innerHTML = data.missing_check;
    document.getElementById("inwaterStat").innerHTML = data.entries_in_water;
    document.getElementById("finishStat").innerHTML = data.entries_finished;
    document.getElementById("connected_users").innerHTML = data.connected_users;
    racestart = data.racestart;
});

//Socket.io handle Leaderboard Data
socket.on('entry_data', function (data) {
    leaderTable.clear();
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
        let detailed_name = value.entry_name + " <a class='text-gray'>" + value.bib_number + "</a>";
        leaderTable.row.add([final_place_text, detailed_name, value.final_time, value.category]);
    });
    leaderTable.draw();
    $(window).trigger('resize');
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
    eventsAllTable.draw();
    $(window).trigger('resize');
});

//Master Clock Logic
setInterval(setClock, 100);
function setClock() {
    let duration = moment.duration(Math.abs(Date.now() - racestart), 'milliseconds');
    document.getElementById("masterclock").innerHTML = Math.round(duration.asHours()) + ":" + duration.minutes() + ":" + duration.seconds() + "." + duration.milliseconds().toString().slice(0,1)
}

//Socket.io Error
socket.on('error', function(data){
    Toast.fire({
        type: 'error',
        title: 'Error with retrieving data...'
    });
});
