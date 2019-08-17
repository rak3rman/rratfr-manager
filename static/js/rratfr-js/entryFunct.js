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
    document.getElementById("totalCount").innerHTML = data.total_entries;
});

//Socket.io Get Statistics
socket.on('entry_data', function (data) {
    entryTable.clear();
    $.each(data, function (i, value) {
        let tools = ("<div class=\"td-actions text-right\">\n" +
            "<button type=\"button\" rel=\"tooltip\" class=\"btn btn-info\" data-original-title=\"\" onclick=\"editEntry('" + value.bib_number + "', '" + value.entry_name + "', '" + value.category + "', '" + value.start_time + "', '" + value.end_time + "')\" title=\"\">\n" +
            "<i class=\"fas fa-edit\"></i> Edit\n" +
            "<button type=\"button\" rel=\"tooltip\" class=\"btn btn-danger ml-2\" data-original-title=\"\" onclick=\"deleteEntry('" + value.bib_number + "')\" title=\"\">\n" +
            "<i class=\"fas fa-times-circle\"></i> Delete\n" +
            "</div></div>"
        );
        entryTable.row.add([value.bib_number, value.entry_name, value.category, value.check_status, value.timing_status, moment(value.start_time).format('MM/DD/YY, h:mm:ss a'), moment(value.end_time).format('MM/DD/YY, h:mm:ss a'), value.final_time, value.final_place, tools]);
    });
    entryTable.draw();
    $(window).trigger('resize');
});

//Socket.io Error
socket.on('error', function (data) {
    Toast.fire({
        type: 'info',
        title: 'Please refresh page'
    });
});

//Entry Add SA
function createEntry() {
    Swal.mixin({
        confirmButtonText: 'Next &rarr;',
        showCancelButton: true,
        progressSteps: ['1', '2', '3', '4'],
    }).queue([
        {
            title: 'Bib Number',
            text: 'Please enter the bib number',
            input: 'text'
        },
        {
            title: 'Entry Name',
            text: 'The team name of the entry',
            input: 'text'
        },
        {
            title: 'Category',
            text: 'The category of the entry',
            input: 'select',
            inputOptions: {
                'DIY': 'DIY Division',
                'HULL': 'HULL Division',
                'UNKNOWN': 'UNKNOWN',
            }
        },
        {
            title: 'Entry Image',
            input: 'file',
            inputAttributes: {
                accept: 'image/*',
                'aria-label': 'Upload a picture of the entry'
            }
        },
    ]).then((result) => {
            if (result.value) {
                let img = result.value[3];
                let formData = new FormData();
                formData.append('file', img, 'entryIMG');
                var xhr = new XMLHttpRequest();
                xhr.open('POST', "/api/entry/create?bib_number=" + result.value[0] + "&entry_name=" + result.value[1] + "&category=" + result.value[2], true);
                xhr.onload = function () {
                    if (xhr.status === 200) {
                        Toast.fire({
                            type: 'success',
                            title: 'Entry has been created!'
                        });
                    } else {
                        Toast.fire({
                            type: 'error',
                            title: 'Error/Raft # Already Exists',
                        });
                    }
                };
                xhr.send(formData);
            }
        }
    )
}

//Entry Edit SA
function editEntry(bib_number, entry_name, category, start_time, end_time) {
    Swal.fire({
        title: 'Edit Entry: ' + entry_name,
        html:
            '<h6 class="mb-0">General Information:</h6>' +
            '<div class="row">\n' +
            '   <label class="col-sm-3 col-form-label text-left pb-0">Bib Number</label>\n' +
            '   <div class="col-sm-9">\n' +
            '       <div class="form-group has-default bmd-form-group">\n' +
            '           <input type="text" class="form-control" value="' + bib_number + '" id="editBib">\n' +
            '       </div>\n' +
            '   </div>\n' +
            '</div>' +
            '<div class="row">\n' +
            '   <label class="col-sm-3 col-form-label text-left pb-0">Entry Name</label>\n' +
            '   <div class="col-sm-9">\n' +
            '       <div class="form-group has-default bmd-form-group">\n' +
            '           <input type="text" class="form-control" value="' + entry_name + '" id="editName">\n' +
            '       </div>\n' +
            '   </div>\n' +
            '</div>' +
            '<div class="row">\n' +
            '   <label class="col-sm-3 col-form-label text-left pb-0">Category</label>\n' +
            '   <div class="col-sm-9">\n' +
            '       <div class="form-group has-default bmd-form-group">\n' +
            '           <input type="text" class="form-control" value="' + category + '" id="editCategory">\n' +
            '       </div>\n' +
            '   </div>\n' +
            '</div>' +
            '<h6 class="mb-0 mt-2">Timing Information:</h6>' +
            '<div class="row">\n' +
            '   <label class="col-sm-3 col-form-label text-left pb-0">Start Time</label>\n' +
            '   <div class="col-sm-9">\n' +
            '       <div class="form-group has-default bmd-form-group">\n' +
            '           <input type="text" class="form-control" value="' + start_time + '" id="editStartTime">\n' +
            '       </div>\n' +
            '   </div>\n' +
            '</div>' +
            '<div class="row">\n' +
            '   <label class="col-sm-3 col-form-label text-left pb-0">End Time</label>\n' +
            '   <div class="col-sm-9">\n' +
            '       <div class="form-group has-default bmd-form-group">\n' +
            '           <input type="text" class="form-control" value="' + end_time + '" id="editEndTime">\n' +
            '       </div>\n' +
            '   </div>\n' +
            '</div>',
        showCancelButton: true,
        confirmButtonText: 'Update',
    }).then(() => {
        let new_bib_number = document.getElementById("editBib").value;
        let new_entry_name = document.getElementById("editName").value;
        let new_category = document.getElementById("editCategory").value;
        let new_start_time = document.getElementById("editStartTime").value;
        let new_end_time = document.getElementById("editEndTime").value;
        if (new_bib_number !== bib_number || new_entry_name !== entry_name || new_category !== category || new_start_time !== start_time || new_end_time !== end_time) {
            if (new_start_time === "null") {
                new_start_time = "";
            }
            if (new_end_time === "null") {
                new_end_time = "";
            }
            $.ajax({
                type: "POST",
                url: "/api/entry/edit",
                data: {
                    old_bib_number: bib_number,
                    bib_number: new_bib_number,
                    entry_name: new_entry_name,
                    category: new_category,
                    start_time: new_start_time,
                    end_time: new_end_time,
                },
                success: function (data) {
                    Toast.fire({
                        type: 'success',
                        title: 'Entry has been updated'
                    });
                },
                error: function (error_reason) {
                    Toast.fire({
                        type: 'error',
                        title: 'Error: ' + error_reason.responseText,
                    });
                }
            });
        }
    })
}

//Entry Delete SA
function deleteEntry(bib_number) {
    Swal.fire({
        title: 'Are you sure?',
        text: "This entry will be deleted forever!",
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if (result.value) {
            $.ajax({
                type: "POST",
                url: "/api/entry/delete",
                data: {
                    bib_number: bib_number,
                },
                success: function (data) {
                    Toast.fire({
                        type: 'success',
                        title: 'Entry has been deleted!'
                    });
                },
                error: function (data) {
                    Toast.fire({
                        type: 'error',
                        title: 'Error in deleting entry...'
                    });
                }
            });
        }
    })
}

//Re-Sort Entries
function sortEntries() {
    Swal.fire({
        title: 'Are you sure?',
        text: "Do you want to re-sort all entries?",
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, sort entries!'
    }).then((result) => {
        if (result.value) {
            $.ajax({
                type: "POST",
                url: "/api/entry/sort",
                success: function (data) {
                    Toast.fire({
                        type: 'success',
                        title: 'Entries have been sorted!'
                    });
                },
                error: function (data) {
                    Toast.fire({
                        type: 'error',
                        title: 'Error in sorting entries...'
                    });
                }
            });
        }
    })
}