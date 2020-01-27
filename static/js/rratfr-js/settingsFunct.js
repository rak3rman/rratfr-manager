/*\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\
RRATFR Manager Front-End JS - Authored by: RAk3rman
\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\*/

//Set SA Toast Settings
const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 5000
});

//Get settings from server
function getSettings() {
    $.ajax({
        type: "GET",
        url: "/api/settings",
        success: function (data) {
            document.getElementById("race_start_time").value = moment(data.race_start_time).format("MM/DD/YYYY hh:mm A");
            document.getElementById("voting_end_time").value = moment(data.voting_end_time).format("MM/DD/YYYY hh:mm A");
            document.getElementById("console_port").value = data.console_port;
            document.getElementById("mongodb_url").value = data.mongodb_url;
            document.getElementById("signup").value = data.signup_mode;
            document.getElementById("debug").value = data.debug_mode;
            if (data.signup_mode === "true") {
                document.getElementById("signup").setAttribute("checked", "");
            }
            if (data.debug_mode === "true") {
                document.getElementById("debug").setAttribute("checked", "");
            }
        },
        error: function (data) {
            Toast.fire({
                type: 'error',
                title: 'Error with sending data...'
            });
        }
    });
    setupPicker();
}

//Update settings to server
function updateSettings() {
    Swal.fire({
        title: 'Save Settings',
        text: "These changes will cause a temporary loss in connection and restart the software",
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Save'
    }).then((result) => {
        if (result.value) {
            $.ajax({
                type: "POST",
                url: "/api/settings",
                data: {
                    race_start_time: moment(document.getElementById("race_start_time").value).format(),
                    voting_end_time: moment(document.getElementById("voting_end_time").value).format(),
                    console_port: document.getElementById("console_port").value,
                    mongodb_url: document.getElementById("mongodb_url").value,
                    signup_mode: document.getElementById("signup").checked,
                    debug_mode: document.getElementById("debug").checked
                },
                success: function (data) {
                    Toast.fire({
                        type: 'success',
                        title: 'Successfully updated settings'
                    });
                },
                error: function (data) {
                    Toast.fire({
                        type: 'error',
                        title: 'Error with sending data...'
                    });
                }
            });
        }
    })
}

//Setup Datetimepicker
function setupPicker() {
    $('#race_start_time').datetimepicker({
        icons: {
            time: "fas fa-clock",
            date: "fa fa-calendar",
            up: "fa fa-chevron-up",
            down: "fa fa-chevron-down",
            previous: 'fa fa-chevron-left',
            next: 'fa fa-chevron-right',
            today: 'fa fa-screenshot',
            clear: 'fa fa-trash',
            close: 'fa fa-remove'
        }
    });
    $('#voting_end_time').datetimepicker({
        icons: {
            time: "fas fa-clock",
            date: "fa fa-calendar",
            up: "fa fa-chevron-up",
            down: "fa fa-chevron-down",
            previous: 'fa fa-chevron-left',
            next: 'fa fa-chevron-right',
            today: 'fa fa-screenshot',
            clear: 'fa fa-trash',
            close: 'fa fa-remove'
        }
    });
}

