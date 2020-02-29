// var lastClicked;
// var grid = clickableGrid(10, 10, function (el, row, col, i) {
//     console.log("You clicked on element:", el);
//     console.log("You clicked on row:", row);
//     console.log("You clicked on col:", col);
//     console.log("You clicked on item #:", i);

//     el.className = 'clicked';
//     if (lastClicked) lastClicked.className = '';
//     lastClicked = el;
// });

// document.body.appendChild(grid);

// function clickableGrid(rows, cols, callback) {
//     var i = 0;
//     var grid = document.createElement('table');
//     grid.className = 'grid';
//     for (var r = 0; r < rows; ++r) {
//         var tr = grid.appendChild(document.createElement('tr'));
//         for (var c = 0; c < cols; ++c) {
//             var cell = tr.appendChild(document.createElement('td'));
//             cell.innerHTML = ++i;
//             cell.addEventListener('click', (function (el, r, c, i) {
//                 return function () {
//                     callback(el, r, c, i);
//                 }
//             })(cell, r, c, i), false);
//         }
//     }
//     return grid;
// }

function colorPicker() {
    var canvasEl = document.getElementById('colorPicker');
    var context = canvasEl.getContext('2d');

    var image = new Image(512, 512);
    image.onload = function () {
        context.drawImage(image, 0, 0, image.width, image.height);
    }
    image.src = "./assets/rgb_hex.png";

    var mouseDown = false;
    canvasEl.addEventListener('mousedown', function (mouseEvent) {
        var imgData = context.getImageData(mouseEvent.offsetX, mouseEvent.offsetY, 1, 1);
        var rgba = imgData.data;
        if (rgba[0] + rgba[1] + rgba[2] != 0) {
            mouseDown = true;
            colorSelected(rgba[0], rgba[1], rgba[2])
            selectionCircle(mouseEvent.offsetX, mouseEvent.offsetY);
        }

    });

    canvasEl.addEventListener('mouseup', function (mouseEvent) {
        mouseDown = false;
    });

    canvasEl.addEventListener('mousemove', function (mouseEvent) {
        if (mouseDown) {
            var imgData = context.getImageData(mouseEvent.offsetX, mouseEvent.offsetY, 1, 1);
            var rgba = imgData.data;
            colorSelected(rgba[0], rgba[1], rgba[2]);
            selectionCircle(mouseEvent.offsetX, mouseEvent.offsetY);
        }
    });
}


function colorSelected(r, g, b) {
    var canvasEL = document.getElementById('colorSelect');
    var context = canvasEL.getContext('2d');
    context.clearRect(0, 0, canvasEL.width, canvasEL.height);

    var radius = 64;

    context.beginPath();
    context.arc(64, 64, radius, 0, 2 * Math.PI, false);
    context.fillStyle = "rgb(" + r + "," + g + "," + b + ")";
    context.fill();

    context.font = '20pt Calibri';
    context.fillText("r : " + r, 4, 170);
    context.fillText("g : " + g, 1, 205);
    context.fillText("b : " + b, 0, 240);
}

function selectionCircle(x, y) {
    var canvasEL = document.getElementById('selectionCircle');
    var context = canvasEL.getContext('2d');
    context.clearRect(0, 0, canvasEL.width, canvasEL.height);

    context.beginPath();
    context.arc(x, y, 6, 0, 2 * Math.PI, false);
    context.lineWidth = 3;
    context.strokeStyle = '#000000';
    context.stroke();
}

colorPicker();
colorSelected(256, 256, 256);
selectionCircle(256, 256);