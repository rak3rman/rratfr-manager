/*\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\
RRATFR Manager Front-End JS - Authored by: RAk3rman
\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\*/

//Redirect to Entry List page with search param
function entrySearch() {
    let searchValue = document.getElementById("searchValue").value;
    location.assign("/entry/list?search=" + searchValue);
}