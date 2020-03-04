/*\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\
RRATFR Manager Front-End JS - Authored by: RAk3rman
\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\*/
//Declare socket.io
let socket = io();
let getDataCheck = 0;
let selected_entry;
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
        $.each(data, function (i, value) {
            entries.append(
                "<div class=\"col-md-6 mt-2 mb-2\">\n" +
                "    <div class=\"card m-0\" onclick=\"selectedEntry('" + value.bib_number + "')\">\n" +
                "        <img class=\"card-img-top\" src=\"/static/img/entries/entry_" + value.bib_number + ".jpg\" alt=\"Entry Image\">\n" +
                "        <div class=\"card-body p-0\" style=\"background: linear-gradient(60deg, #66bb6a, #43a047)\" id='vote" + value.bib_number + "'></div>\n" +
                "        <div class=\"card-body\">\n" +
                "            <h4 class=\"card-text mt-0\">" + value.entry_name + " <a class=\"text-gray\">" + value.bib_number + " " + value.category + "</a></h4>\n" +
                "        </div>\n" +
                "    </div>\n" +
                "</div>"
            );
        });
        getDataCheck = 1;
    }
});

//Socket.io handle Statistics
socket.on('race_data', function(data){
    race_start_time = moment(data.race_start_time).format("x");
    voting_end_time_ms = moment(data.voting_end_time).format("x");
    document.getElementById("votingopen").innerHTML = "Votes can be cast on " + moment(data.race_start_time).format('MMMM Do, YYYY') + " from <strong>" + moment(data.race_start_time).format('h:mma') + " to " + moment(data.voting_end_time).format('h:mma') + " CDT</strong>. ";
    document.getElementById("votingclosed").innerHTML = "Votes can be cast on " + moment(data.race_start_time).format('MMMM Do, YYYY') + " from <strong>" + moment(data.race_start_time).format('h:mma') + " to " + moment(data.voting_end_time).format('h:mma') + " CDT</strong>. ";
    timeCheck();
});

//Mark entry
function selectedEntry(bib_number) {
    if (selected_entry) {
        document.getElementById("vote" + selected_entry).innerHTML = "";
    }
    document.getElementById("vote" + bib_number).innerHTML = "<p class=\"mb-0 p-1 text-white\"><i class=\"fas fa-check-circle\"></i> Selected for People's Choice</p>";
    selected_entry = bib_number;

}

//Check to see if voting is open
function timeCheck() {
    let closed = document.getElementById("closed");
    let open = document.getElementById("open");
    if (!((race_start_time < Date.now()) && (Date.now() < voting_end_time_ms))) {
        //Voting Closed
        closed.style.display = "block";
        open.style.display = "none";
    } else if (votingstat === 0) {
        //Voting Open
        closed.style.display = "none";
        open.style.display = "block";
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
    if (selected_entry) {
        Swal.fire({
            title: 'Final Submission',
            html: "<h5>Are you sure you want to select this entry for the People's Choice Award? Remember, you only get one entry per device.</h5><p>Selected Bib #: " + selected_entry + "</p>",
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
                        bib_number: selected_entry,
                        user_ip: userIP,
                        user_data: userData
                    },
                    success: function (data) {
                        Swal.fire({
                            title: 'Vote Submitted!',
                            html: "<p>Thank you for casting your vote for the People's Choice Award! Click below to see the results!</p>",
                            type: 'success',
                            showCancelButton: false,
                            confirmButtonColor: '#3085d6',
                            confirmButtonText: 'Results'
                        }).then((result) => {
                            window.location.href = "/";
                        })
                    },
                    error: function (data) {
                        if (data.responseText === "User Already Voted") {
                            Swal.fire({
                                title: 'Already Voted!',
                                html: "<p>Only one vote is allowed per device. Click below to see the results!</p>",
                                type: 'error',
                                showCancelButton: false,
                                confirmButtonColor: '#3085d6',
                                confirmButtonText: 'Results'
                            }).then((result) => {
                                window.location.href = "/";
                            })
                        } else if (data.responseText) {
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