/*\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\
RRATFR Manager Front-End JS - Authored by: RAk3rman
\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\*/
//Declare socket.io
let socket = io();
let getDataCheck = 0;
//Set SA Toast Settings
const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 5000
});
//Variables
let votingstat = 0;
let race_start_time;
let voting_end_time_ms;

//Socket.io Get Entries
let entries = $('#entries');
socket.on('entry_data', function (data) {
    if (getDataCheck === 0) {
        entries.append(
            "<option value=\"\"></option>"
        );
        $.each(data, function (i, value) {
            entries.append(
                "<option data-img-src='/static/img/entries/entry_" + value.bib_number + ".jpg' value='" + value.bib_number + "'>" + value.entry_name + " " + value.bib_number + " | " + value.category + "</option>"
            );
        });
        $("select").imagepicker({
            show_label: true,
        });
        getDataCheck = 1;
    }
});

//Socket.io handle Statistics
socket.on('race_data', function(data){
    race_start_time = moment(data.race_start_time).format("x");
    voting_end_time_ms = moment(data.voting_end_time).format("x");
    document.getElementById("votingopen").innerHTML = "Votes can be cast on " + moment(data.race_start_time).format('MMMM Do, YYYY') + " from <strong>" + moment(data.race_start_time).format('h:mma') + " to " + moment(data.voting_end_time).format('h:mma') + " CDT</strong>. ";
    //document.getElementById("racedate").innerHTML = moment(data.race_start_time).format('dddd, MMMM Do, YYYY');
    //document.getElementById("year1").innerHTML = moment(data.race_start_time).format('YYYY');
    //document.getElementById("year2").innerHTML = moment(data.race_start_time).format('YYYY');
    document.getElementById("votingclosed").innerHTML = "Votes can be cast on " + moment(data.race_start_time).format('MMMM Do, YYYY') + " from <strong>" + moment(data.race_start_time).format('h:mma') + " to " + moment(data.voting_end_time).format('h:mma') + " CDT</strong>. ";
    timeCheck();
});

//Check to see if voting is open
function timeCheck() {
    let closed = document.getElementById("closed");
    let open = document.getElementById("open");
    if (!((race_start_time < Date.now()) && (Date.now() < voting_end_time_ms))) {
        //Voting Closed
        closed.style.display = "block";
        open.style.display = "none";
        document.getElementById("votingstat").innerHTML = "<a class='text-danger'>CLOSED</a>";
    } else if (votingstat === 0) {
        //Voting Open
        closed.style.display = "none";
        open.style.display = "block";
        document.getElementById("votingstat").innerHTML = "<a class='text-success'>OPEN</a>";
        votingstat = 1;
    }
}

//Get User Information for IP Limiter
let userIP;
let userData;
function getInfo() {
    $.ajax({
        type: "GET",
        url: "https://api.muctool.de/whois",
        success: function (data) {
            userIP = data.ip;
            userData = data;
        },
        error: function (data) {
            Toast.fire({
                type: 'info',
                title: 'Please refresh page'
            });
        }
    });
}

//Send Vote
function sendVote() {
    let bib_number = $("select").data("picker").selected_values()[0];
    if (bib_number) {
        Swal.fire({
            title: 'Final Submission',
            html: "<p>Are you sure you want to select this entry for the People's Choice Award? Remember, you only get one entry per device.</p><p>Selected Bib #: " + bib_number + "</p>",
            type: 'info',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Submit'
        }).then((result) => {
            if (result.value) {
                $.ajax({
                    type: "POST",
                    url: "/api/voting/people's-choice",
                    data: {
                        bib_number: bib_number,
                        user_ip: userIP,
                        user_data: userData
                    },
                    success: function (data) {
                        Swal.fire({
                            title: 'Vote Submitted!',
                            html: "<p>Thank you for casting your vote for the People's Choice Award! Click below to live the live results!</p>",
                            type: 'success',
                            showCancelButton: false,
                            confirmButtonColor: '#3085d6',
                            confirmButtonText: 'Live Results'
                        }).then((result) => {
                            window.location.href = "/results/live";
                        })
                    },
                    error: function (data) {
                        if (data.responseText) {
                            Toast.fire({
                                type: 'error',
                                title: data.responseText
                            });
                        } else {
                            Toast.fire({
                                type: 'error',
                                title: 'Error, please try again'
                            });
                        }
                    }
                });
            }
        })
    } else {
        Toast.fire({
            type: 'info',
            title: 'Please select an entry'
        });
    }
}

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