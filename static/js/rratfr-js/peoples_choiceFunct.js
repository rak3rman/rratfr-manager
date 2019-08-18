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

//Socket.io Get Entries
let entries = $('#entries');
socket.on('entry_data', function (data) {
    if (getDataCheck === 0) {
        entries.append(
            "<option value=\"\"></option>"
        );
        $.each(data, function (i, value) {
            entries.append(
                "<option data-img-src='/static/img/entries/entry_" + value.bib_number + ".jpg' value='" + value.bib_number + "'>Bib #: " + value.bib_number + " | Category: " + value.category + "</option>"
            );
        });
        $("select").imagepicker({
            show_label: true,
        });
        getDataCheck = 1;
    }
});

//Check to see if voting is open
let votingstat = 0;
let starttime = 1566147600000;
let endtime = 1566162000000;

function timeCheck() {
    let closed = document.getElementById("closed");
    let open = document.getElementById("open");
    if (!((starttime < Date.now()) && (Date.now() < endtime))) {
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
                    url: "/api/voting",
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