/*\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\
RRATFR Manager Front-End JS - Authored by: RAk3rman
\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\*/
//Declare socket.io
let socket = io();
//Setup Variables
let race_start_time;
let voting_end_time;
let voting_results_time;
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
    "searching": false,
    "bLengthChange": false,
    "order": [[2, "asc"]],
    "columnDefs": [
        {"orderable": false, "targets": 0}
    ],
    "language": {
        "emptyTable": "Entries will be updated soon!"
    },
};
let pastSettings = {
    "lengthMenu": [
        [10, 25, 50, -1],
        [10, 25, 50, "All"]
    ],
    "responsive": true,
    "order": false,
    "columnDefs": [
        { "orderable": false, "targets": 0 }
    ],
    "language": {
        "emptyTable": "Entries will be updated soon!"
    },
};
let resultslive = $('#resultslive').DataTable(tableSettings);
let results2019 = $('#results2019').DataTable(pastSettings);
let results2018 = $('#results2018').DataTable(pastSettings);
let results2017 = $('#results2017').DataTable(pastSettings);
let results2016 = $('#results2016').DataTable(pastSettings);
$(window).trigger('resize');
// Socket.io Get Statistics
socket.on('race_data', function (data) {
    // document.getElementById("totalStat").innerHTML = data["total_entries"];
    // document.getElementById("inwaterStat").innerHTML = data["entries_in_water"];
    // document.getElementById("finishStat").innerHTML = data["entries_finished"];
    // document.getElementById("pushedDate1").innerHTML = 'Updated ' + moment(data["updated_total_entries"]).fromNow();
    // document.getElementById("pushedDate2").innerHTML = 'Updated ' + moment(data["updated_entries_in_water"]).fromNow();
    // document.getElementById("pushedDate3").innerHTML = 'Updated ' + moment(data["updated_entries_finished"]).fromNow();
    // document.getElementById("votes_cast").innerHTML = data["votes_cast"].toString() + ' Votes Cast';
    document.getElementById("race_times").innerHTML = "<strong>Race Starts & People's Choice Voting Starts:</strong> " + moment(data["race_start_time"]).format("MMMM Do YYYY, h:mm a") +
        "<br><strong>People's Choice Voting Ends:</strong> " + moment(data["voting_end_time"]).format("MMMM Do YYYY, h:mm a") +
        "<br><strong>Individual Contest Results Release:</strong> " + moment(data["voting_results_time"]).format("MMMM Do YYYY, h:mm a");
    race_start_time = data["race_start_time"];
    voting_end_time = data["voting_end_time"];
    voting_results_time = data["voting_results_time"];
    viewresultsHandler();
});

//Socket.io Get Leaderboard Data
socket.on('entry_data', function (data) {
    resultslive.clear();
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
        resultslive.row.add([final_place_text, detailed_name, value.final_time, value.category]);
    });
    resultslive.draw();
});

//Handle the viewing options of the results
function viewresultsHandler() {
    let countdown_element = document.getElementById("countdown_element");
    let leaderboard_element = document.getElementById("leaderboard_element");
    let contest_results_element = document.getElementById("contest_results_element");
    let spinner_element = document.getElementById("spinner_element");
    if (moment(race_start_time) > moment()) {
        document.getElementById("countdown_time").innerHTML = countdown(moment(race_start_time).format("x")).toString();
        document.getElementById("race_start_time").innerHTML = moment(race_start_time).format("MMMM Do YYYY, h:mm a");
        countdown_element.style.display = "block";
        leaderboard_element.style.display = "none";
        contest_results_element.style.display = "none";
        spinner_element.style.display = "none";
    } else if (moment(race_start_time) < moment()) {
        countdown_element.style.display = "none";
        leaderboard_element.style.display = "block";
        spinner_element.style.display = "none";
        if (moment(voting_results_time) < moment()) {
            contest_results_element.style.display = "block";
        } else {
            contest_results_element.style.display = "none";
        }
    }
}

//Select Dashboard Image
function setImage() {
    let random = (Math.floor(Math.random() * 8)) + 1;
    document.getElementById("coverImage").style = "background-image: url('/static/img/race-" + random + ".jpg');";
}

//Socket.io Error
socket.on('error', function (data) {
    Toast.fire({
        type: 'info',
        title: 'Please refresh page'
    });
});