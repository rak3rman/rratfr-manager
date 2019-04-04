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

//Get Statistics
function getStatistics() {
    $.ajax({
        type: "GET",
        url: "/api/statistics",
        success: function (data) {
            document.getElementById("totalStat").innerHTML = data.total_entries;
            document.getElementById("inwaterStat").innerHTML = data.entries_in_water;
            document.getElementById("finishStat").innerHTML = data.entries_finished;
        },
        error: function (data) {
            console.log(data);
            Toast.fire({
                type: 'error',
                title: 'Error with retrieving data...'
            });
        }
    });
}