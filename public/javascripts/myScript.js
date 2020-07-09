//document.querySelector("button").style.color = "red";

document.getElementById("#comment").style.color = "red";

document.getElementById("#comment").addEventListener("click", like);


function like() {
    alert("clicked");
    //Secret.findOne({})
    console.log("clicked");
    console.log(req.body.comment);
}

$(function() {
    $("button").on("click", function() {
        console.log("button pressed");
    });
});