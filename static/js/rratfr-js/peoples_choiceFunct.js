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
        console.log(data);
        entries.append(
            "<option value=\"\"></option>"
        );
        $.each(data, function (i, value) {
            entries.append(
                "<option data-img-src=\"/static/img/race-1.jpg\" value='" + value.bib_number + "'>Bib #: " + value.bib_number + " | Category: " + value.category + "</option>"
            );
        });
        $("select").imagepicker({
            show_label: true,
        });
        getDataCheck = 1;
    }
});

//Get User Information for IP Limiter
let userIP;
let userData;
function getInfo(){
    $.ajax({
        type: "GET",
        url: "https://api.muctool.de/whois",
        success: function (data) {
            console.log(data);
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
                        Toast.fire({
                            type: 'success',
                            title: 'Success!'
                        });
                    },
                    error: function (data) {
                        Toast.fire({
                            type: 'error',
                            title: 'Error in sending vote...'
                        });
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