/**
 * @type HTMLCanvasElement
 */

var curTool = "pencil"

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
drawingContext.imageSmoothingEnabled = false;

const CELL_SIDE_COUNT = 8;
const cellPixelLength = canvas.width / CELL_SIDE_COUNT;
const colorHistory = {};
var previewHistory = ["//location", "//prev color"];
let mousePos = { x: undefined, y: undefined };

Object.prototype.getKeyByValue = function (value) {
    var res = []
    for (var prop in this) {
        if (this.hasOwnProperty(prop)) {
            if (this[prop] === value)
                res.push(prop)
        }
    }
    return res
}

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

    console.log(cellX, cellY)

    drawingContext.fillStyle = colorInput.value
    drawingContext.fillRect(Math.floor(startX), Math.floor(startY), Math.floor(cellPixelLength), Math.floor(cellPixelLength))
    colorHistory[cur] = colorInput.value
}


function deleteCell() {
    const canvasBoundingRect = canvas.getBoundingClientRect()
    const cellX = Math.floor((mousePos.x - canvasBoundingRect.left) / cellPixelLength)
    const cellY = Math.floor((mousePos.y - canvasBoundingRect.top) / cellPixelLength)
    const cur = cellX + "_" + cellY

    const startX = cellX * cellPixelLength
    const startY = cellY * cellPixelLength

    console.log(cellX, cellY)

    drawingContext.clearRect(Math.floor(startX), Math.floor(startY), Math.floor(cellPixelLength), Math.floor(cellPixelLength))
    colorHistory[cur] = "clear"
}

function bucketFill() {
    var values = colorHistory.getKeyByValue('#000000')
    console.log(values)
    const canvasBoundingRect = canvas.getBoundingClientRect()
    const cellX = Math.floor((mousePos.x - canvasBoundingRect.left) / cellPixelLength)
    const cellY = Math.floor((mousePos.y - canvasBoundingRect.top) / cellPixelLength)

    const startX = cellX * cellPixelLength
    const startY = cellY * cellPixelLength

    console.log(cellX, cellY)

    for (var i = 0; i < values.length; i++) {
        var cur = values[i].split("_")

        drawingContext.fillStyle = colorInput.value
        drawingContext.fillRect(Math.floor(cur[0] * cellPixelLength), Math.floor(cur[1] * cellPixelLength), Math.floor(cellPixelLength), Math.floor(cellPixelLength))
    }

    colorHistory[cur] = colorInput.value

}

function previewAction() {
    id = setInterval(() => {
        const canvasBoundingRect = canvasOverlay.getBoundingClientRect()
        const cellX = Math.floor((mousePos.x - canvasBoundingRect.left) / cellPixelLength)
        const cellY = Math.floor((mousePos.y - canvasBoundingRect.top) / cellPixelLength)

        const startX = cellX * cellPixelLength
        const startY = cellY * cellPixelLength


        overlayContext.clearRect(0, 0, canvas.width, canvas.height);

        overlayContext.fillStyle = colorInput.value
        overlayContext.fillRect(startX, startY, cellPixelLength, cellPixelLength)
    }, 1);
}

let id = null;
function mouseHolding(e) {
    id = setInterval(() => curTool == "pencil" ? fillCell() : curTool == "eraser" ? deleteCell() : curTool == "bucket" ? bucketFill() : colorPicker(), 1);
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
    curTool = "pencil"
    document.body.style.cursor = "url('icons/pencil.png'), auto";
}

function switchBucket() {
    curTool = "bucket"
    document.body.style.cursor = "url('icons/bucket.png'), auto";
}

function switchEraser() {
    curTool = "eraser"
    document.body.style.cursor = "url('icons/eraser.png'), auto";
}
