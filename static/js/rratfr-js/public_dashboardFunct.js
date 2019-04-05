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

//Socket.io Get Statistics
socket.on('race_data', function(data){
    document.getElementById("totalStat").innerHTML = data.total_entries;
    document.getElementById("inwaterStat").innerHTML = data.entries_in_water;
    document.getElementById("finishStat").innerHTML = data.entries_finished;
});

//Socket.io Error
socket.on('error', function(data){
    console.log(data);
    Toast.fire({
        type: 'error',
        title: 'Error with retrieving data...'
    });
});

//Set Table Settings
let tableSettings = {
    "lengthMenu": [
        [10, 25, 50, -1],
        [10, 25, 50, "All"]
    ],
    "responsive": true,
    "language": {
        "emptyTable": "No one has crossed the finish line yet!"
    }
};
let leaderTable = $('#leaderTable').DataTable(tableSettings);

//Select Dashboard Image
function setImage() {
    let random = (Math.floor(Math.random() * 8)) + 1;
    document.getElementById("coverImage").style = "background-image: url('/static/img/race-" + random + ".jpg'); background-size: cover; background-position: top center;";
    //Create banner to reach website
    Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false
    }).fire({
        type: 'info',
        title: 'See the live timing results at rratfr.rockcodenight.org'
    });
}