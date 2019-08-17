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
                        title: 'Entry has been created!'
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

//Socket.io Error
socket.on('error', function (data) {
    Toast.fire({
        type: 'info',
        title: 'Please refresh page'
    });
});

//Select Dashboard Image
function setImage() {
    let random = (Math.floor(Math.random() * 8)) + 1;
    document.getElementById("coverImage").style = "background-image: url('/static/img/race-" + random + ".jpg'); background-size: cover; background-position: top center;";
}