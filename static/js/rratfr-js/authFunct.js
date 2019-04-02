/*\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\
RRATFR Manager Front-End JS - Authored by: RAk3rman
\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\*/

//Send Request on Enter
function onEnter() {
    document.getElementById("enter").onkeypress = function (event) {
        if (event.keyCode === 13 || event.which === 13) {
            document.getElementById("enterClick").click();
        }
    };
}