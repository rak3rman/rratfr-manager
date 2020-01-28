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
    "order": [[ 2, "asc" ]],
    "responsive": true,
};
let pcTable = $('#pcTable').DataTable(tableSettings);

//Get votes from database
function getVotes() {
    $.ajax({
        type: "GET",
        url: "/api/voting/people's-choice",
        success: function (data) {
            pcTable.clear();
            $.each(data, function (i, value) {
                let user_data = ("<div class=\"td-actions text-left\">\n" +
                    "<button type=\"button\" rel=\"tooltip\" class=\"btn btn-tertiary\" data-original-title=\"\" onclick=\'viewData(" + JSON.stringify(value.user_data) + ")\' title=\"\">\n" +
                    "<i class=\"fas fa-user-lock\"></i></i> User Data\n" +
                    "</div></div>"
                );
                pcTable.row.add([ value.bib_number, value.user_ip, moment(value.created_date).format('MM/DD/YY h:mm:ss a'), user_data]);
            });
            pcTable.draw();
            $(window).trigger('resize');
        },
        error: function (data) {
            Toast.fire({
                type: 'info',
                title: 'Please refresh page'
            });
        }
    });
}

//Display SA of User Data
function viewData(data) {
    Swal.fire({
        type: 'info',
        title: 'User Data',
        text: data,
    })
}

//Socket.io Get Statistics
socket.on('race_data', function (data) {
    document.getElementById("votes_cast").innerHTML = data.votes_cast;
});

//Socket.io Error
socket.on('error', function (data) {
    Toast.fire({
        type: 'info',
        title: 'Please refresh page'
    });
});