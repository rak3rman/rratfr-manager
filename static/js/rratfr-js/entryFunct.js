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

//Set Table Settings
let searchValue = "";
window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
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
    }
};
let entryTable = $('#entryTable').DataTable(tableSettings);

//Entry List
function entryList() {
    entryTable.clear();
    $.ajax({
        type: "GET",
        url: "/api/entry/details/all",
        success: function (data) {
            let entryCount = 0;
            $.each(data, function (i, value) {
                console.log(value.bib_number, value.entry_name, value.category, value.created_date);
                entryTable.row.add([value.bib_number, value.entry_name, value.category, value.created_date]);
                entryCount += 1;
            });
            document.getElementById("totalCount").innerHTML = entryCount;
            entryTable.draw();
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

//Entry Add SA
function createEntry() {
    Swal.mixin({
        confirmButtonText: 'Next &rarr;',
        showLoaderOnConfirm: true,
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
                'raft': 'Raft',
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
                    entryList();
                },
                error: function (data) {
                    console.log(data);
                    Swal.fire({
                        title: 'Entry was not created...',
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

//Node Edit SA
function nodeEdit(nodeID) {
    $.ajax({
        type: "GET",
        url: "/api/node/details",
        data: {
            node_id: nodeID,
        },
        success: function (data) {
            Swal.fire({
                title: 'Edit Node: ' + data[0]["node_name"],
                text: 'ID: ' + nodeID,
                html:
                    '<div class="row">\n' +
                    '   <label class="col-sm-3 col-form-label text-left pb-0">Node ID</label>\n' +
                    '   <div class="col-sm-9">\n' +
                    '       <div class="form-group has-default bmd-form-group">\n' +
                    '           <input type="text" class="form-control" disabled value="' + nodeID + '">\n' +
                    '       </div>\n' +
                    '   </div>\n' +
                    '</div>' +
                    '<div class="row">\n' +
                    '   <label class="col-sm-3 col-form-label text-left pb-0">Node Name</label>\n' +
                    '   <div class="col-sm-9">\n' +
                    '       <div class="form-group has-default bmd-form-group">\n' +
                    '           <input type="text" class="form-control" value="' + data[0]["node_name"] + '" id="editName">\n' +
                    '       </div>\n' +
                    '   </div>\n' +
                    '</div>' +
                    '<div class="row">\n' +
                    '   <label class="col-sm-3 col-form-label text-left pb-0">Node IP</label>\n' +
                    '   <div class="col-sm-9">\n' +
                    '       <div class="form-group has-default bmd-form-group">\n' +
                    '           <input type="text" class="form-control" value="' + data[0]["node_ip"] + '" id="editIP">\n' +
                    '       </div>\n' +
                    '   </div>\n' +
                    '</div>',
                showCancelButton: true,
                confirmButtonText: 'Update',
            }).then(() => {
                let nodeIP = document.getElementById("editIP").value;
                let nodeName = document.getElementById("editName").value;
                $.ajax({
                    type: "POST",
                    url: "/api/node/edit",
                    data: {
                        node_name: nodeName,
                        node_ip: nodeIP,
                        node_id: nodeID,
                    },
                    success: function (data) {
                        Toast.fire({
                            type: 'success',
                            title: 'Node has been updated'
                        });
                        setTimeout(function () {
                            nodeList();
                        }, 500);
                    },
                    error: function (data) {
                        console.log(data);
                        Toast.fire({
                            type: 'error',
                            title: 'Error in updating node...'
                        });
                    }
                });
            })
        },
        error: function (data) {
            console.log(data);
            Toast.fire({
                type: 'error',
                title: 'Error in requesting data...'
            });
        }
    });
}
