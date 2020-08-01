module.exports = getDate;

function getDate() {

    var today = new Date();



    var date = today.getDate() + "/" + (today.getMonth() + 1) + '/' + today.getFullYear()

    var min = today.getMinutes() + 30;
    console.log(min);
    if (min < 60) {
        var hour = today.getHours() + 5;
        var minutes = min;
        var time = hour + ":" + minutes;

    } else {

        var hour = today.getHours() + 6;
        var minutes = min - 60;
        var time = hour + ":" + minutes;
    }
    console.log(time);

    //var time = today.getHours() + ":" + today.getMinutes();

    var dateTime = date + '  ' + time


    return dateTime

};