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
    "responsive": true,
    "order": false,
    "columnDefs": [
        { "orderable": false, "targets": 0 }
    ],
    "language": {
        "emptyTable": "Entries will be updated soon!"
    },
};
let results2018 = $('#results2018').DataTable(tableSettings);
let results2017 = $('#results2017').DataTable(tableSettings);
let results2016 = $('#results2016').DataTable(tableSettings);

//Countdown Timer
let racedate;
function setCountdown(racedatesent) {
    racedate = racedatesent;
}
function getCountdown() {
    if (racedate > Date.now()) {
        document.getElementById("countdown").innerHTML = countdown(racedate).toString();
    } else {
        document.getElementById("countdown").innerHTML = "The Race is ON! Go to the <a href=\"/results/live\" class=\"text-info\">Live Leaderboard</a>!"
    }
}

//Select Dashboard Image
function setImage() {
    let random = (Math.floor(Math.random() * 8)) + 1;
    document.getElementById("coverImage").style = "background-image: url('/static/img/race-" + random + ".jpg'); background-size: cover; background-position: top center;";
}