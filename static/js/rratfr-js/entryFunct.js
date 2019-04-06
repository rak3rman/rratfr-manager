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

//Socket.io Get Statistics
socket.on('race_data', function (data) {
    document.getElementById("totalCount").innerHTML = data.total_entries;
});

//Socket.io Get Statistics
socket.on('entry_data', function (data) {
    entryTable.clear();
    $.each(data, function (i, value) {
        entryTable.row.add([value.bib_number, value.entry_name, value.category, value.safety_status, value.timing_status, moment(value.start_time).format('MM/DD/YY, h:mm:ss a'), moment(value.end_time).format('MM/DD/YY, h:mm:ss a'), value.final_time, value.final_place,]);
    });
    entryTable.draw();
});

//Socket.io Error
socket.on('error', function (data) {
    console.log(data);
    Toast.fire({
        type: 'error',
        title: 'Error with retrieving data...'
    });
});

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
                'RAFT': 'Raft',
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