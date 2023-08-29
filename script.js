/**
 * @type HTMLCanvasElement
 */

var curTool = "pencil"
document.body.style.cursor = "url('icons/pencil.png'), auto";

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

const CELL_SIDE_COUNT = 64;
const cellPixelLength = canvas.width / CELL_SIDE_COUNT;
const colorHistory = {};
var previewHistory = ["//location", "//prev color"];
let mousePos = { x: undefined, y: undefined };
setClearCells()

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

    drawingContext.clearRect(Math.floor(startX), Math.floor(startY), Math.floor(cellPixelLength), Math.floor(cellPixelLength))
    colorHistory[cur] = "clear"
}

function bucketFill() {
    const canvasBoundingRect = canvas.getBoundingClientRect()
    const cellX = Math.floor((mousePos.x - canvasBoundingRect.left) / cellPixelLength)
    const cellY = Math.floor((mousePos.y - canvasBoundingRect.top) / cellPixelLength)
    const cur = cellX + "_" + cellY

    const startX = cellX * cellPixelLength
    const startY = cellY * cellPixelLength

    console.log(cur)

    var values = colorHistory.getKeyByValue(colorHistory[cur])

    for (var i = 0; i < values.length; i++) {
        var curValue = values[i].split("_")

        colorHistory[values[i]] = colorInput.value

        drawingContext.fillStyle = colorInput.value
        drawingContext.fillRect(Math.floor(curValue[0] * cellPixelLength), Math.floor(curValue[1] * cellPixelLength), Math.floor(cellPixelLength), Math.floor(cellPixelLength))
    }
}

function eyedropperTool() {
    const canvasBoundingRect = canvas.getBoundingClientRect()
    const cellX = Math.floor((mousePos.x - canvasBoundingRect.left) / cellPixelLength)
    const cellY = Math.floor((mousePos.y - canvasBoundingRect.top) / cellPixelLength)
    const cur = cellX + "_" + cellY

    const startX = cellX * cellPixelLength
    const startY = cellY * cellPixelLength

    if (colorHistory[cur]) {
        colorInput.value = colorHistory[cur]
    }
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

function setClearCells() {
    for (var i = 0; i < CELL_SIDE_COUNT; i++) {
        for (var k = 0; k < CELL_SIDE_COUNT; k++) {
            colorHistory[`${k}_${i}`] = "clear"
        }
        colorHistory[`0_${i}`] = "clear"
    }
}

let id = null;
function mouseHolding(e) {
    id = setInterval(() => curTool == "pencil" ? fillCell() : curTool == "eraser" ? deleteCell() : curTool == "bucket" ? bucketFill() : eyedropperTool(), 1);
}
function mouseRelease() {
    clearInterval(id);
}

canvasOverlay.addEventListener("mousedown", mouseHolding)
canvasOverlay.addEventListener("mouseup", () => {
    mouseRelease();
})
canvasOverlay.addEventListener("mouseout", () => {
    mouseRelease();
})

window.addEventListener('mousemove', (event) => {
    mousePos = { x: event.clientX, y: event.clientY };
});


clearButton.addEventListener('click', handleClearButtonClick)
canvasOverlay.addEventListener("mouseover", previewAction)


function switchPencil() {
    curTool = "pencil"
    document.body.style.cursor = "url('icons/pencil.png'), auto";

    document.getElementById("bucket").classList.remove("activeButton")
    document.getElementById("eraser").classList.remove("activeButton")
    document.getElementById("eyedropper").classList.remove("activeButton")
    document.getElementById("pencil").classList.add("activeButton")
}

function switchBucket() {
    curTool = "bucket"
    document.body.style.cursor = "url('icons/bucket.png'), auto";

    document.getElementById("bucket").classList.add("activeButton")
    document.getElementById("eraser").classList.remove("activeButton")
    document.getElementById("eyedropper").classList.remove("activeButton")
    document.getElementById("pencil").classList.remove("activeButton")
}

function switchEraser() {
    curTool = "eraser"
    document.body.style.cursor = "url('icons/eraser.png'), auto";

    document.getElementById("bucket").classList.remove("activeButton")
    document.getElementById("eraser").classList.add("activeButton")
    document.getElementById("eyedropper").classList.remove("activeButton")
    document.getElementById("pencil").classList.remove("activeButton")
}

function switchEyedropper() {
    curTool = "eyedropper"
    document.body.style.cursor = "url('icons/eyedropper.png'), auto";

    document.getElementById("bucket").classList.remove("activeButton")
    document.getElementById("eraser").classList.remove("activeButton")
    document.getElementById("eyedropper").classList.add("activeButton")
    document.getElementById("pencil").classList.remove("activeButton")
}
