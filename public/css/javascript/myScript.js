console.log("reached");
document.getElementById("#like").addEventListener("click", like);

function like() {
    //Secret.findOne({})
    console.log("clicked");
    console.log(req.body.click);
}

$(function() {
    $("button").on("click", function() {
        console.log("button pressed");
    });
});