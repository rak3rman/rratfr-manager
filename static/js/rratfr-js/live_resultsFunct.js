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
//Set Table Settings
let tableSettings = {
    "lengthMenu": [
        [10, 25, 50, -1],
        [10, 25, 50, "All"]
    ],
    "responsive": true,
    "order": [[2, "asc"]],
    "columnDefs": [
        {"orderable": false, "targets": 0}
    ],
    "language": {
        "emptyTable": "Entries will be updated soon!"
    },
};
let results2018 = $('#results2018').DataTable(
    {
        "lengthMenu": [
            [10, 25, 50, -1],
            [10, 25, 50, "All"]
        ],
        "responsive": true,
        "ordering": false,
        "searching": false,
        "bLengthChange": false
    }
);
let leaderTable = $('#leaderTable').DataTable(tableSettings);
$(window).trigger('resize');
//Socket.io Get Statistics
socket.on('race_data', function (data) {
    document.getElementById("totalStat").innerHTML = data.total_entries;
    document.getElementById("inwaterStat").innerHTML = data.entries_in_water;
    document.getElementById("finishStat").innerHTML = data.entries_finished;
    document.getElementById("pushedDate1").innerHTML = 'Updated ' + moment(data.updated_total_entries).fromNow();
    document.getElementById("pushedDate2").innerHTML = 'Updated ' + moment(data.updated_entries_in_water).fromNow();
    document.getElementById("pushedDate3").innerHTML = 'Updated ' + moment(data.updated_entries_finished).fromNow();
    document.getElementById("votes_cast").innerHTML = data.votes_cast + ' Votes Cast';
});

//Socket.io Get Leaderboard Data
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
});

//Select Dashboard Image
function setImage() {
    let random = (Math.floor(Math.random() * 8)) + 1;
    document.getElementById("coverImage").style = "background-image: url('/static/img/race-" + random + ".jpg'); background-size: cover; background-position: top center;";
}

//Socket.io Error
socket.on('error', function (data) {
    Toast.fire({
        type: 'info',
        title: 'Please refresh page'
    });
});