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
let searchValue = "";
window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
    if (value) {
        searchValue = decodeURI(value);
    }
});
let tableSettings = {
    "lengthMenu": [
        [10, 25, 50, -1],
        [10, 25, 50, "All"]
    ],
    "responsive": true,
    "search": {
        "search": searchValue,
    },
};
let entryTable = $('#entryTable').DataTable(tableSettings);

//Socket.io Get Statistics
socket.on('race_data', function (data) {
    //document.getElementById("totalCount").innerHTML = data.total_entries;
});

//Socket.io Get Statistics
socket.on('entry_data', function (data) {
    entryTable.clear();
    $.each(data, function (i, value) {
        entryTable.row.add([value.bib_number, value.entry_name, value.category, value.check_status, value.timing_status]);
    });
    entryTable.draw();
    $(window).trigger('resize');
});

//Socket.io Error
socket.on('error', function (data) {
    Toast.fire({
        type: 'error',
        title: 'Error with retrieving data...'
    });
});

//Select Dashboard Image
function setImage() {
    let random = (Math.floor(Math.random() * 8)) + 1;
    document.getElementById("coverImage").style = "background-image: url('/static/img/race-" + random + ".jpg'); background-size: cover; background-position: top center;";
}