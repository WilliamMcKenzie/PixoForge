/**
 * @type HTMLCanvasElement
 */

var canvas = document.getElementById("canvas")
var canvasOverlay = document.getElementById("overlay")
var canvasBackground = document.getElementById("canvasBackground")
var guide = document.getElementById("guide")
var colorInput = document.getElementById("colorInput")
var clearButton = document.getElementById("clearButton")
var toggleGuide = document.getElementById("toggleGuide")

const drawingContext = canvas.getContext("2d")
const overlayContext = canvasOverlay.getContext("2d")
const backgroundContext = canvasBackground.getContext("2d")

const CELL_SIDE_COUNT = 8;
const cellPixelLength = canvas.width / CELL_SIDE_COUNT;
const colorHistory = {};
var previewHistory = ["//location", "//prev color"];
let mousePos = { x: undefined, y: undefined };

//Set canvas checkerboard

// Set default color
colorInput.value = "#000000"

//Set canvas bg color 
drawingContext.fillStyle = "rgba(255, 99, 71, 0)"
drawingContext.fillRect(0, 0, canvas.width, canvas.height)

function handleCanvasMouseDown(e) {
    if (e.button !== 0) {
        return;
    }

    const canvasBoundingRect = canvas.getBoundingClientRect()
    const x = Math.floor((e.clientX - canvasBoundingRect.left) / cellPixelLength)
    const y = Math.floor((e.clientY - canvasBoundingRect.top) / cellPixelLength)

    fillCell(x, y)
}

function handleClearButtonClick() {
    const yes = confirm("Do you want to clear the canvas?")

    if (!yes) return

    drawingContext.clearRect(0, 0, canvas.width, canvas.height);
}

function handleToggleGuideChange() {

}

function fillCell() {
    const canvasBoundingRect = canvas.getBoundingClientRect()
    const cellX = Math.floor((mousePos.x - canvasBoundingRect.left) / cellPixelLength)
    const cellY = Math.floor((mousePos.y - canvasBoundingRect.top) / cellPixelLength)
    const cur = cellX + "_" + cellY

    const startX = cellX * cellPixelLength
    const startY = cellY * cellPixelLength

    console.log(startX, startY)

    drawingContext.fillStyle = colorInput.value
    drawingContext.fillRect(startX, startY, cellPixelLength, cellPixelLength)
    colorHistory[cur] = colorInput.value
}

function previewAction() {
    id = setInterval(() => {
        const canvasBoundingRect = canvasOverlay.getBoundingClientRect()
        const cellX = Math.floor((mousePos.x - canvasBoundingRect.left) / cellPixelLength)
        const cellY = Math.floor((mousePos.y - canvasBoundingRect.top) / cellPixelLength)

        const startX = cellX * cellPixelLength
        const startY = cellY * cellPixelLength

        console.log(startX, startY)

        overlayContext.clearRect(0, 0, canvas.width, canvas.height);

        overlayContext.fillStyle = colorInput.value
        overlayContext.fillRect(startX, startY, cellPixelLength, cellPixelLength)
    }, 1);
}

let id = null;
function mouseHolding(e) {
    id = setInterval(() => fillCell(), 1);
}
function mouseRelease() {
    clearInterval(id);
}

canvasOverlay.addEventListener("mousedown", mouseHolding)
canvasOverlay.addEventListener("mouseup", () => {
    console.log("mouseup");
    mouseRelease();
})

window.addEventListener('mousemove', (event) => {
    mousePos = { x: event.clientX, y: event.clientY };
});


clearButton.addEventListener('click', handleClearButtonClick)
toggleGuide.addEventListener('change', handleToggleGuideChange)
canvasOverlay.addEventListener("mouseover", previewAction)


function switchPencil() {

}

function switchBucket() {

}

function switchEraser() {

}
