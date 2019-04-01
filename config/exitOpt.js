/*\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\
App/Filename : AUTHBASE/config/exitOpt.js
Author       : RAk3rman
\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\*/

//Check if in Testing ENV, Run Tests, Exit
exports.testCheck = function () {
    let testENV = process.env.testENV || process.argv[2];
    if (testENV === "test") {
        console.log('Started In Testing Environment - Exiting Program');
        process.exit(0);
    }
};
