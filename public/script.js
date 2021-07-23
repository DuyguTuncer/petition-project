const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");

context.lineWidth = 5;
context.lineJoin = "round";
context.strokeStyle = "#000000";
context.lineCap = "round";

let isDrawing = false;
let x = 0;
let y = 0;

function canvasSignature(event) {
    if (!isDrawing) return;
    console.log(event);
    context.beginPath();
    context.moveTo(x, y);
    context.lineTo(event.offsetX, event.offsetY);
    context.stroke();
    [x, y] = [event.offsetX, event.offsetY];
    $("#hiddenForCanvas").val(canvas.toDataURL());
}

canvas.addEventListener("mousedown", (event) => {
    isDrawing = true;
    [x, y] = [event.offsetX, event.offsetY];
});

canvas.addEventListener("mousemove", canvasSignature);
canvas.addEventListener("mouseup", () => (isDrawing = false ));
canvas.addEventListener("mouseout", () => (isDrawing = false));
