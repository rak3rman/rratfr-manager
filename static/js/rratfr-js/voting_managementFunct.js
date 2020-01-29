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
let tableSettings1 = {
    "lengthMenu": [
        [10, 25, 50, -1],
        [10, 25, 50, "All"]
    ],
    "order": [[ 2, "asc" ]],
    "responsive": true,
};
let tableSettings2 = {
    "lengthMenu": [
        [10, 25, 50, -1],
        [10, 25, 50, "All"]
    ],
    "order": [[ 0, "asc" ]],
    "responsive": true,
};
let pcTable = $('#pcTable').DataTable(tableSettings1);
let voteTable = $('#voteTable').DataTable(tableSettings2);

//Socket.io handle Leaderboard Data
socket.on('entry_data', function (data) {
    voteTable.clear();
    $.each(data, function (i, value) {
        let judgesButton = ("<div class=\"td-actions text-left\">\n" +
            "<button type=\"button\" rel=\"tooltip\" class=\"btn btn-outline-success\" data-original-title=\"\" onclick=\"judgesWinner('" + value.bib_number + "', '" + value.entry_name + "', '" + value.category + "')\" title=\"\">\n" +
            "<i class=\"fas fa-trophy\"></i> Select as Judges Choice Winner\n" +
            "</div></div>"
        );
        let detailed_name = value.entry_name + " <a class='text-gray'>" + value.bib_number + "</a>";
        voteTable.row.add([ value.vote_count, detailed_name, value.category, judgesButton]);
    });
    voteTable.draw();
});

//Socket.io Get Statistics
socket.on('race_data', function (data) {
    document.getElementById("votes_cast").innerHTML = data.votes_cast;
});

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

//Display SA of User Data
function judgesWinner(bib_number, entry_name, category) {
    Swal.fire({
        title: 'Judges Choice Award',
        html:
            '<h5 class="mb-3">Please confirm your selection of the Judges Choice Award below. This value cannot be changed once submitted.</h5>' +
            '<h5 class="mb-0"><strong>General Information:</strong></h5>' +
            '<div class="row">\n' +
            '   <label class="col-sm-3 col-form-label text-left pb-0">Bib Number</label>\n' +
            '   <div class="col-sm-9">\n' +
            '       <div class="form-group has-default bmd-form-group">\n' +
            '           <input type="text" class="form-control" disabled value="' + bib_number + '">\n' +
            '       </div>\n' +
            '   </div>\n' +
            '</div>' +
            '<div class="row">\n' +
            '   <label class="col-sm-3 col-form-label text-left pb-0">Entry Name</label>\n' +
            '   <div class="col-sm-9">\n' +
            '       <div class="form-group has-default bmd-form-group">\n' +
            '           <input type="text" class="form-control" disabled value="' + entry_name + '">\n' +
            '       </div>\n' +
            '   </div>\n' +
            '</div>' +
            '<div class="row">\n' +
            '   <label class="col-sm-3 col-form-label text-left pb-0">Category</label>\n' +
            '   <div class="col-sm-9">\n' +
            '       <div class="form-group has-default bmd-form-group">\n' +
            '           <input type="text" class="form-control" disabled value="' + category + '">\n' +
            '       </div>\n' +
            '   </div>\n' +
            '</div>',
        type: 'info',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Confirm'
    }).then((result) => {
        if (result.value) {
            $.ajax({
                type: "POST",
                url: "/api/voting/judges-choice",
                data: {
                    bib_number: bib_number,
                },
                success: function (data) {
                    Toast.fire({
                        type: 'success',
                        title: 'Judges Choice Award selection updated!'
                    });
                },
                error: function (data) {
                    Toast.fire({
                        type: 'error',
                        title: 'Error in assigning award...'
                    });
                }
            });
        }
    })
}

//Socket.io Error
socket.on('error', function (data) {
    Toast.fire({
        type: 'info',
        title: 'Please refresh page'
    });
});