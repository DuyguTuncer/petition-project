const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
context.strokeStyle = "#000000";
context.lineWidth = 5;
context.lineJoin = "round";
context.lineCap = "round";
let isDrawing = false;
let X = 0;
let Y = 0;

$("#canvas").on("mousedown", function (e) {
    if (e.target === document.querySelector("#canvas")) {
        console.log("log if mousedown");
        if (!isDrawing) {
            context.beginPath();

            $(document).on("mousemove", function (e) {
                console.log("log if mousedraw");
                e.preventDefault();

                context.moveTo(X, Y);
                context.lineTo(e.offsetX, e.offsetY);
                context.stroke();
                X = e.offsetX;
                Y = e.offsetY;
            });
        }
        $(document).on("mouseup", function (e) {
            $(document).off("mousemove");
            $(document).off("mouseup");
            console.log("log if mousedraw is off");
            $("#hiddenForCanvas").val(canvas.toDataURL());
        });
    }
});

var searchInput = $("input");

searchInput.on("input", function (e) {
    console.log("input handler was called");
    var userInput = searchInput.val();
});
