/*\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\
RRATFR Manager Front-End JS - Authored by: RAk3rman
\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\*/
//Declare socket.io
let socket = io();

//Pass socket.io call to check bib #
function check_Bib(value) {
    console.log(value);
    socket.emit('check_bib', value);
}

//Socket.io React to bib check result
socket.on('check_bib_result', function(data){
    console.log(data);
    if (data === "start_ready") {
        console.log('Ready Check 2');
    }
});

//Socket.io Error
socket.on('error', function(data){
    console.log(data);
    Toast.fire({
        type: 'error',
        title: 'Error with retrieving data...'
    });
});