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
    "scrollY": "200px",
    "scrollCollapse": true,
    "paging": false
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
        let name;
        if (value.check_status === "NOT CHECKED") {
            name = ("<div class=\"td-actions\">\n" +
                "<button type=\"button\" rel=\"tooltip\" class=\"btn btn-info mr-2\" data-original-title=\"\" onclick=\"checkEntry('" + value.bib_number + "', '" + value.entry_name + "', '" + value.category + "', '" + value.start_time + "', '" + value.end_time + "')\" title=\"\">\n" +
                "<i class=\"fas fa-check-double\"></i> Check\n" +
                "</button>" + value.entry_name +
                "</div>"
            );
        } else {
            name = "<a class='text-success'><i class=\"fas fa-check-circle\"></i></a> " + value.entry_name;
        }
        entryTable.row.add([name, value.bib_number, value.category]);
    });
    entryTable.draw();
    $(window).trigger('resize');
});

//Entry Add SA
function createEntry() {
    Swal.mixin({
        confirmButtonText: 'Next &rarr;',
        showCancelButton: true,
        progressSteps: ['1', '2', '3'],
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
            }
        }
    ]).then((result) => {
        if (result.value) {
            $.ajax({
                type: "POST",
                url: "/api/entry/create",
                data: {
                    bib_number: result.value[0],
                    entry_name: result.value[1],
                    category: result.value[2]
                },
                success: function (data) {
                    Swal.fire({
                        title: 'Entry Created',
                        html: 'Parameters sent: <pre><code>' +
                            JSON.stringify(result.value) +
                            '</code></pre>',
                        confirmButtonText: 'OK',
                        type: 'success'
                    });
                },
                error: function (error_reason) {
                    Swal.fire({
                        title: 'Error: ' + error_reason.responseText,
                        html: 'Parameters sent: <pre><code>' +
                            JSON.stringify(result.value) +
                            '</code></pre>',
                        confirmButtonText: 'OK',
                        type: 'error'
                    })
                }
            });
        }
    })
}

//Entry Check SA
function checkEntry(bib_number, entry_name, category, start_time, end_time) {
    Swal.fire({
        title: 'Entry Details: ' + entry_name,
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
            '</div>',
        showCancelButton: true,
        confirmButtonText: 'Ready to Go!',
    }).then((value) => {
        let new_bib_number = document.getElementById("editBib").value;
        let new_entry_name = document.getElementById("editName").value;
        let new_category = document.getElementById("editCategory").value;
        if (value.value === true) {
            $.ajax({
                type: "POST",
                url: "/api/entry/timing/update",
                data: {
                    old_bib_number: bib_number,
                    bib_number: new_bib_number,
                    entry_name: new_entry_name,
                    category: new_category,
                    status: "checked"
                },
                success: function (data) {
                    Toast.fire({
                        type: 'success',
                        title: 'Entry has been updated'
                    });
                },
                error: function (data) {
                    Toast.fire({
                        type: 'error',
                        title: 'Error in updating entry...'
                    });
                }
            });
        }
    })
}

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