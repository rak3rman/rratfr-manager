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
    document.getElementById("totalStat").innerHTML = data.total_entries;
    document.getElementById("pushedDate1").innerHTML = 'Updated ' + moment(data.updated_total_entries).fromNow();
});

//Socket.io Get Statistics
socket.on('entry_data', function (data) {
    entryTable.clear();
    $.each(data, function (i, value) {
        let tools = ("<div class=\"td-actions text-right\">\n" +
            "<button type=\"button\" rel=\"tooltip\" class=\"btn btn-info\" data-original-title=\"\" onclick=\"editEntry('" + value.bib_number + "', '" + value.entry_name + "', '" + value.category + "', '" + value.start_time + "', '" + value.end_time + "', '" + value.timing_status + "')\" title=\"\">\n" +
            "<i class=\"fas fa-edit\"></i> Edit\n" +
            "<button type=\"button\" rel=\"tooltip\" class=\"btn btn-danger ml-2\" data-original-title=\"\" onclick=\"deleteEntry('" + value.bib_number + "')\" title=\"\">\n" +
            "<i class=\"fas fa-times-circle\"></i> Delete\n" +
            "</div></div>"
        );
        entryTable.row.add([value.bib_number, value.entry_name, value.category, value.vote_count, value.timing_status, moment(value.start_time).format('MM/DD/YY h:mm:ss a'), moment(value.end_time).format('MM/DD/YY h:mm:ss a'), value.final_time, value.final_place, tools]);
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
            text: 'Please enter the bib number. This number cannot change once set.',
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
            text: 'Please upload a picture of the entry. This image can only be uploaded once.',
            input: 'file',
            inputAttributes: {
                accept: 'image/*',
                'aria-label': 'Upload a picture of the entry'
            }
        },
    ]).then((result) => {
            if (result.value) {
                let imageFile = result.value[3];
                // console.log('originalFile instanceof Blob', imageFile instanceof Blob); // true
                // console.log(`originalFile size ${imageFile.size / 1024 / 1024} MB`);
                let options = {
                    maxSizeMB: 1,
                    maxWidthOrHeight: 1920,
                    useWebWorker: true
                };
                imageCompression(imageFile, options)
                    .then(function (compressedFile) {
                        // console.log('compressedFile instanceof Blob', compressedFile instanceof Blob); // true
                        // console.log(`compressedFile size ${compressedFile.size / 1024 / 1024} MB`); // smaller than maxSizeMB
                        //Send image
                        let img = compressedFile;
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
                    })
                    .catch(function (error) {
                        console.log(error.message);
                    });
            }
        }
    )
}

//Entry Edit SA
function editEntry(bib_number, entry_name, category, start_time, end_time, timing_status) {
    Swal.fire({
        title: 'Edit Entry: ' + entry_name,
        html:
            '<h5 class="mb-0"><strong>General Information:</strong></h5>' +
            '<div class="row">\n' +
            '   <label class="col-sm-3 col-form-label text-left pb-0">Bib Number</label>\n' +
            '   <div class="col-sm-9">\n' +
            '       <div class="form-group has-default bmd-form-group">\n' +
            '           <input type="text" class="form-control" disabled value="' + bib_number + '" id="editBib">\n' +
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
            '<h5 class="mb-0 mt-2"><strong>Timing Information:</strong></h5>' +
            '<h6 class="mb-0 mt-0">Entry must be in finished state to recalculate final time</h6>' +
            '<div class="row">\n' +
            '   <label class="col-sm-3 col-form-label text-left pb-0">Status</label>\n' +
            '   <div class="col-sm-9 mb-1">\n' +
            '      <select class="selectpicker float-left" data-size="3" data-style="select-with-transition" title="Status">\n' +
            '          <option id="waiting" value="waiting"> Waiting </option>\n' +
            '          <option id="en_route" value="en_route"> En Route </option>\n' +
            '          <option id="finished" value="finished"> Finished </option>\n' +
            '          <option id="dq" value="dq"> Disqualified </option>\n' +
            '          <option id="reset" value="reset"> Reset </option>\n' +
            '      </select>' +
            '   </div>\n' +
            '</div>' +
            '<div class="row">\n' +
            '   <label class="col-sm-3 col-form-label text-left pb-0">Start Time</label>\n' +
            '   <div class="col-sm-9">\n' +
            '       <div class="form-group">\n' +
            '           <input type="text" class="form-control" value="' + moment(start_time).format("MM/DD/YYYY hh:mm A") + '" id="editStartTime">\n' +
            '       </div>\n' +
            '   </div>\n' +
            '</div>' +
            '<div class="row">\n' +
            '   <label class="col-sm-3 col-form-label text-left pb-0">End Time</label>\n' +
            '   <div class="col-sm-9">\n' +
            '       <div class="form-group">\n' +
            '           <input type="text" class="form-control" value="' + moment(end_time).format("MM/DD/YYYY hh:mm A") + '" id="editEndTime">\n' +
            '       </div>\n' +
            '   </div>\n' +
            '</div>',
        onOpen: function() {
            $(".selectpicker").selectpicker();
            console.log(timing_status);
            document.getElementById(timing_status).setAttribute("selected", "");
            if (document.getElementById("editStartTime").value !== null) {
                $('#editStartTime').datetimepicker({
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
            if (document.getElementById("editEndTime").value !== null) {
                $('#editEndTime').datetimepicker({
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
        },
        showCancelButton: true,
        confirmButtonText: 'Update',
    }).then((result) => {
        if (result.value) {
            let new_bib_number = document.getElementById("editBib").value;
            let new_entry_name = document.getElementById("editName").value;
            let new_category = document.getElementById("editCategory").value;
            let new_start_time = moment(document.getElementById("editStartTime").value).format();
            let new_end_time = moment(document.getElementById("editEndTime").value).format();
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