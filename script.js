/**
 * @type HTMLCanvasElement
 */

var curTool = "pencil"
document.body.style.cursor = "url('icons/cursor.png'), auto";
if (document.querySelector('.selectedTool')) document.querySelector('.selectedTool').classList.remove('selectedTool')
document.getElementById("pencil").classList.add('selectedTool')

var canvas = document.getElementById("canvas")
var canvasOverlay = document.getElementById("overlay")
var canvasBackground = document.getElementById("canvasBackground")
var canvasSelection = document.getElementById("selection")
var guide = document.getElementById("guide")
var colorInput = document.getElementById("colorInput")
var clearButton = document.getElementById("clearButton")
var toggleGuide = document.getElementById("toggleGuide")

const drawingContext = canvas.getContext("2d")
const overlayContext = canvasOverlay.getContext("2d")
const backgroundContext = canvasBackground.getContext("2d")
const selectionContext = canvasSelection.getContext("2d")
drawingContext.imageSmoothingEnabled = false;

var CELL_SIDE_COUNT = 64;
var cellPixelLength = canvas.width / CELL_SIDE_COUNT;
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


//make pallet
var colors = document.querySelectorAll(".color")

colors.forEach(color => {
    color.addEventListener('click', () => {
        rgbColor = window.getComputedStyle(color).getPropertyValue("background-color")
        var rgb = rgbColor.replace(/^rgba?\(|\s+|\)$/g, '').split(',');
        colorInput.value = rgbToHex(parseInt(rgb[0]), parseInt(rgb[1]), parseInt(rgb[2]))

        //set selected
        if (document.querySelector('.selectedColor')) document.querySelector('.selectedColor').classList.remove('selectedColor')
        if (document.querySelector('.selectedInput')) document.querySelector('.selectedInput').classList.remove('selectedInput')
        color.classList.add('selectedColor')
    })
});

function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

colorInput.addEventListener('click', () => {
    if (document.querySelector('.selectedColor')) document.querySelector('.selectedColor').classList.remove('selectedColor')
    if (document.querySelector('.selectedInput')) document.querySelector('.selectedInput').classList.remove('selectedInput')
    colorInput.classList.add('selectedInput')
})
function handleCanvasMouseDown(e) {
    if (e.button !== 0) {
        return;
    }

    const canvasBoundingRect = canvas.getBoundingClientRect()
    const x = Math.floor((e.clientX - canvasBoundingRect.left) / cellPixelLength)
    const y = Math.floor((e.clientY - canvasBoundingRect.top) / cellPixelLength)

    fillCell(x, y)
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

    if (colorHistory[cur]) {
        colorInput.value = colorHistory[cur]
        if (document.querySelector('.selectedColor')) document.querySelector('.selectedColor').classList.remove('selectedColor')
        if (document.querySelector('.selectedInput')) document.querySelector('.selectedInput').classList.remove('selectedInput')
        colorInput.classList.add('selectedInput')
    }
}

function lineTool(e) {
    console.log("line")
    const canvasBoundingRect = canvas.getBoundingClientRect()
    const cellX = Math.floor((e.clientX - canvasBoundingRect.left) / cellPixelLength)
    const cellY = Math.floor((e.clientY - canvasBoundingRect.top) / cellPixelLength)
    const cur = cellX + "_" + cellY

    const startX = cellX * cellPixelLength
    const startY = cellY * cellPixelLength

    selectionContext.fillStyle = colorInput.value
    drawingContext.fillRect(Math.floor(startX), Math.floor(startY), Math.floor(cellPixelLength), Math.floor(cellPixelLength))

    id = setInterval(() => {
        drawSelection(startX, startY, cellX, cellY, canvasBoundingRect, selectionContext, "temp")
    }, 1)
}

var lastSelection = []


function drawSelection(startX, startY, cellX, cellY, canvasBoundingRect, ctx, status) {

    const cellX2 = Math.floor((mousePos.x - canvasBoundingRect.left) / cellPixelLength)
    const cellY2 = Math.floor((mousePos.y - canvasBoundingRect.top) / cellPixelLength)

    const startX2 = cellX2 * cellPixelLength
    const startY2 = cellY2 * cellPixelLength

    selectionContext.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = colorInput.value
    ctx.fillRect(Math.floor(startX2), Math.floor(startY2), Math.floor(cellPixelLength), Math.floor(cellPixelLength))

    var distancex = 0
    var distancey = 0

    console.log(Math.abs(cellX - cellX2))

    for (var i = 0; i < Math.abs(cellX - cellX2); i++) {

        console.log(status)

        if (cellX2 < cellX) {
            distancex--
        } else {
            distancex++
        }

        if (status == "final") {
            drawingContext.fillRect(Math.floor(startX + distancex * cellPixelLength), Math.floor(startY2), Math.floor(cellPixelLength), Math.floor(cellPixelLength))
            drawingContext.fillRect(Math.floor(startX + distancex * cellPixelLength), Math.floor(startY), Math.floor(cellPixelLength), Math.floor(cellPixelLength))
        } else {
            ctx.fillRect(Math.floor(startX + distancex * cellPixelLength), Math.floor(startY2), Math.floor(cellPixelLength), Math.floor(cellPixelLength))
            ctx.fillRect(Math.floor(startX + distancex * cellPixelLength), Math.floor(startY), Math.floor(cellPixelLength), Math.floor(cellPixelLength))
        }
    }
    for (var i = 0; i < Math.abs(cellY - cellY2); i++) {

        if (cellY2 < cellY) {
            distancey--
        } else {
            distancey++
        }

        ctx.fillRect(Math.floor(startX), Math.floor(startY + distancey * cellPixelLength), Math.floor(cellPixelLength), Math.floor(cellPixelLength))
        ctx.fillRect(Math.floor(startX2), Math.floor(startY + distancey * cellPixelLength), Math.floor(cellPixelLength), Math.floor(cellPixelLength))
    }
    lastSelection = [startX, startY, cellX, cellY, canvasBoundingRect]
}

function previewAction() {
    curTool == "pencil" ? document.body.style.cursor = "url('icons/pencil_cursor.png'), auto" : curTool == "bucket" ? document.body.style.cursor = "url('icons/bucket_cursor.png'), auto" : curTool == "eraser" ? document.body.style.cursor = "url('icons/eraser_cursor.png'), auto" : curTool == "eyedropper" ? document.body.style.cursor = "url('icons/eyedropper_cursor.png'), auto" : document.body.style.cursor = "url('icons/favicon.png'), auto";

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

function resizeCanvas() {
}

let id = null;
function mouseHolding(e) {
    console.log(curTool)
    if (curTool != "line") {
        id = setInterval(() => curTool == "pencil" ? fillCell() : curTool == "eraser" ? deleteCell() : curTool == "bucket" ? bucketFill() : eyedropperTool(), 1);
    } else {
        lineTool(e)
        selectionContext.clearRect(0, 0, canvas.width, canvas.height);
        canvasSelection.classList.add("selectionActive")
    }
}
function mouseRelease() {
    if (curTool != "line") {
        clearInterval(id);
    }
    else {
        clearInterval(id);
        canvasSelection.classList.remove("selectionActive")
        console.log(lastSelection)
        drawSelection(lastSelection[0], lastSelection[1], lastSelection[2], lastSelection[3], canvas.getBoundingClientRect(), drawingContext, "final")
    }
}

function mouseOut() {
    clearInterval(id);
    document.body.style.cursor = "url('icons/cursor.png'), auto"
    overlayContext.clearRect(0, 0, canvas.width, canvas.height);
    canvasSelection.classList.remove("selectionActive")
}

canvasOverlay.addEventListener("mousedown", mouseHolding)
canvasOverlay.addEventListener("mouseup", () => { mouseRelease() })
canvasOverlay.addEventListener("mouseout", () => {
    mouseOut();
})

window.addEventListener('mousemove', (event) => {
    mousePos = { x: event.clientX, y: event.clientY };
});

canvasOverlay.addEventListener("mouseover", previewAction)


function switchPencil() {
    curTool = "pencil"

    if (document.querySelector('.selectedTool')) document.querySelector('.selectedTool').classList.remove('selectedTool')
    document.getElementById("pencil").classList.add('selectedTool')
}

function switchBucket() {
    curTool = "bucket"

    if (document.querySelector('.selectedTool')) document.querySelector('.selectedTool').classList.remove('selectedTool')
    document.getElementById("bucket").classList.add('selectedTool')
}

function switchEraser() {
    curTool = "eraser"
    document.body.style.cursor = "url('icons/eraser_cursor.png'), auto";

    if (document.querySelector('.selectedTool')) document.querySelector('.selectedTool').classList.remove('selectedTool')
    document.getElementById("eraser").classList.add('selectedTool')
}

function switchEyedropper() {
    curTool = "eyedropper"

    if (document.querySelector('.selectedTool')) document.querySelector('.selectedTool').classList.remove('selectedTool')
    document.getElementById("eyedropper").classList.add('selectedTool')
}

function switchLine() {
    curTool = "line"

    if (document.querySelector('.selectedTool')) document.querySelector('.selectedTool').classList.remove('selectedTool')
    document.getElementById("line").classList.add('selectedTool')
}

function switchSelect() {
    curTool = "line"

    if (document.querySelector('.selectedTool')) document.querySelector('.selectedTool').classList.remove('selectedTool')
    document.getElementById("eyedropper").classList.add('selectedTool')
}


var draggableElements = document.querySelectorAll(".draggable")

draggableElements.forEach(element => {
    let offsetX
    let offsetY

    const move = (e) => {
        element.style.left = `${e.clientX - offsetX}px`;
        element.style.top = `${e.clientY - offsetY}px`;
    }

    element.addEventListener('mousedown', (e) => {
        offsetX = e.clientX - element.offsetLeft
        offsetY = e.clientY - element.offsetTop
        document.addEventListener('mousemove', move)
    })

    document.addEventListener("mouseup", () => {
        document.removeEventListener('mousemove', move)
    })
});
