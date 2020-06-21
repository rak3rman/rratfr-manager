/*\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\
RRATFR Manager Front-End JS - Authored by: RAk3rman
\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\*/
//Declare socket.io
let socket = io();
//Setup Variables
let race_start_time;
let voting_end_time;
let voting_results_time;
let awaiting_date;
let contest_status = 0;
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
    document.getElementById("totalStat").innerHTML = data["total_entries"];
    document.getElementById("inwaterStat").innerHTML = data["entries_in_water"];
    document.getElementById("finishStat").innerHTML = data["entries_finished"];
    document.getElementById("votes_cast").innerHTML = data["votes_cast"];
    if (data["awaiting_date"] === "true") {
        document.getElementById("race_times").innerHTML = "What is the People's Choice Award? The chuck a what? Get an idea of what race day will look like below!";
    } else {
        document.getElementById("race_times").innerHTML = "<strong>Race Starts & People's Choice Voting Starts:</strong> " + moment(data["race_start_time"]).format("MMMM Do YYYY, h:mm a") +
            "<br><strong>People's Choice Voting Ends:</strong> " + moment(data["voting_end_time"]).format("MMMM Do YYYY, h:mm a") +
            "<br><strong>Individual Contest Results Release:</strong> " + moment(data["voting_results_time"]).format("MMMM Do YYYY, h:mm a");
    }
    race_start_time = data["race_start_time"];
    voting_end_time = data["voting_end_time"];
    voting_results_time = data["voting_results_time"];
    awaiting_date = data["awaiting_date"];
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
        let detailed_name = "<div href=\"/static/img/entries/entry_" + value.bib_number + ".jpg\" class=\"lightitem\" title=\"" + value.entry_name + " | #" + value.bib_number + " " + value.category + "\">" + value.entry_name + " <span class='text-gray'>#" + value.bib_number + "</span></div>";
        resultslive.row.add([final_place_text, detailed_name, value.final_time, value.category]);
    });
    resultslive.draw();
    lightGallery(document.getElementById('lightgallery'), {
        selector: '.lightitem'
    });
});

//Handle the viewing options of the results
function viewresultsHandler() {
    let countdown_element = document.getElementById("countdown_element");
    let awaiting_element = document.getElementById("awaiting_element");
    let leaderboard_element = document.getElementById("leaderboard_element");
    let contest_results_element = document.getElementById("contest_results_element");
    let spinner_element = document.getElementById("spinner_element");
    let statistics_element = document.getElementById("statistics_element");
    console.log(awaiting_date);
    if (awaiting_date === "true") {
        document.getElementById("desc_spread").innerHTML = "<h4>Ahoy, Mateys! Here you can view past race results, review race information, or pace the Rock River Path as you wait for the " + moment(race_start_time).format("YYYY") + " RRATFR. On race day, you can use this page to see live race results and vote for People's Choice!</h4>\n" +
            "                    <br>\n" +
            "                    <div class=\"row ml-0\">\n" +
            "                        <a href=\"https://www.rratfr.com/blog\" class=\"btn btn-info btn-raised btn-lg mr-2\">\n" +
            "                            <i class=\"fas fa-bookmark\"></i> View the Blog\n" +
            "                        </a>\n" +
            "                        <a href=\"https://www.rratfr.com/about\" class=\"btn btn-muted btn-raised btn-lg\">\n" +
            "                            <i class=\"fas fa-info-circle\"></i> About the Race\n" +
            "                        </a>\n" +
            "                    </div>";
        document.getElementById("awaiting_year").innerHTML = moment(race_start_time).format("YYYY");
        countdown_element.style.display = "none";
        awaiting_element.style.display = "block";
        leaderboard_element.style.display = "none";
        contest_results_element.style.display = "none";
        spinner_element.style.display = "none";
    } else {
        if (moment(race_start_time) > moment()) {
            document.getElementById("countdown_time").innerHTML = countdown(moment(race_start_time).format("x")).toString();
            document.getElementById("race_start_time").innerHTML = moment(race_start_time).format("MMMM Do YYYY, h:mm a");
            document.getElementById("desc_spread").innerHTML = "<h4>Ahoy, Mateys! Here you can view past race results, review race information, or stare at the countdown for the " + moment(race_start_time).format("YYYY") + " RRATFR. On race day, " + moment(race_start_time).format("MMMM Do YYYY") + ", you can use this page to see live race results and vote for People's Choice!</h4>\n" +
                "                    <br>\n" +
                "                    <div class=\"row ml-0\">\n" +
                "                        <a href=\"https://www.rratfr.com/blog\" class=\"btn btn-info btn-raised btn-lg mr-2\">\n" +
                "                            <i class=\"fas fa-bookmark\"></i> View the Blog\n" +
                "                        </a>\n" +
                "                        <a href=\"https://www.rratfr.com/about\" class=\"btn btn-muted btn-raised btn-lg\">\n" +
                "                            <i class=\"fas fa-info-circle\"></i> About the Race\n" +
                "                        </a>\n" +
                "                    </div>";
            countdown_element.style.display = "block";
            awaiting_element.style.display = "none";
            leaderboard_element.style.display = "none";
            contest_results_element.style.display = "none";
            spinner_element.style.display = "none";
            contest_status = 0;
        } else if (moment(race_start_time) < moment()) {
            countdown_element.style.display = "none";
            awaiting_element.style.display = "none";
            leaderboard_element.style.display = "block";
            spinner_element.style.display = "none";
            document.getElementById("desc_spread").innerHTML = "<h4>Ahoy, Mateys! Here you can see live race results, vote for the People's Choice Award, and see the winners of the Judges Choice Award and the Chuck a Duck Race!</h4>\n" +
                "                    <br>\n" +
                "                    <div class=\"row ml-0\">\n" +
                "                        <a href=\"/voting/people's-choice\" target=\"_blank\" class=\"btn btn-info btn-raised btn-lg mr-2\">\n" +
                "                            <i class=\"fas fa-vote-yea\"></i> Vote for People's Choice\n" +
                "                        </a>\n" +
                "                        <a href=\"https://www.rratfr.com/about\" class=\"btn btn-muted btn-raised btn-lg\">\n" +
                "                            <i class=\"fas fa-info-circle\"></i> About the Race\n" +
                "                        </a>\n" +
                "                    </div>";
            if (moment(voting_results_time) < moment() && contest_status === 0) {
                $.ajax({
                    type: "GET",
                    url: "/api/voting/results",
                    success: function (data) {
                        document.getElementById("pc_winner").innerHTML = data.pc_winner;
                        document.getElementById("jc_winner").innerHTML = data.jc_winner;
                        document.getElementById("cd1_winner").innerHTML = data.cd1_winner;
                        document.getElementById("cd2_winner").innerHTML = data.cd2_winner;
                        document.getElementById("cd3_winner").innerHTML = data.cd3_winner;
                    },
                    error: function (data) {
                        Toast.fire({
                            type: 'error',
                            title: 'Error in retrieving results'
                        });
                    }
                });
                contest_status = 1;
                contest_results_element.style.display = "block";
            } else if (moment(voting_results_time) > moment()) {
                contest_results_element.style.display = "none";
            }
            if (moment(voting_results_time) < moment()) {
                statistics_element.style.display = "none";
            } else {
                statistics_element.style.display = "block";
            }
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