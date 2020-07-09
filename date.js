module.exports = getDate;

function getDate() {


    var today = new Date();

    var day = new Date().toLocaleString('en-us', { weekday: 'long' });

    var date = today.getDate() + "/" + (today.getMonth() + 1) + '/' + today.getFullYear()

    var time = today.getHours() + ":" + today.getMinutes();

    var dateTime = day + " " + date + '  ' + time


    return dateTime

};