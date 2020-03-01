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
function project(p, a, b) {
    var atob = [b[0] - a[0], b[1] - a[1]];
    var atop = [p[0] - a[0], p[1] - a[1]];
    var len = atob[0] * atob[0] + atob[1] * atob[1];
    var dot = atop[0] * atob[0] + atop[1] * atob[1];
    var t = Math.min(1, Math.max(0, dot / len));

    dot = (b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0]);
    var point = [a[0] + atob[0] * t, a[1] + atob[1] * t];
    return point;
}

function colorPicker() {
    var canvasEl = document.getElementById('colorPicker');
    var context = canvasEl.getContext('2d');

    var image = new Image(256, 256);
    var delta_x = (canvasEl.width - image.width) / 2;
    var delta_y = (canvasEl.height - image.height) / 2;

    var points = [];
    points.push([128, 5]);
    points.push([20, 66]);
    points.push([20, 190]);
    points.push([128, 252]);
    points.push([236, 190]);
    points.push([236, 66]);
    for (var i = 0; i < 6; i++) {
        points[i][0] = (points[i][0] + delta_x);
        points[i][1] = (points[i][1] + delta_y);
    }

    image.onload = function () {
        context.drawImage(image, delta_x, delta_y, image.width, image.height);
        // context.beginPath();
        // context.strokeStyle = '#ffffff';
        // context.moveTo(points[0][0], points[0][1]);
        // for (var i = 1; i < 6; i++) {
        //     context.lineTo(points[i][0], points[i][1]);
        // }
        // context.stroke();
    }
    image.src = "./assets/rgb_hex.png";


    var mouseDown = false;
    canvasEl.addEventListener('mousedown', function (mouseEvent) {
        var imgData = context.getImageData(mouseEvent.offsetX, mouseEvent.offsetY, 1, 1);
        var rgba = imgData.data;
        if (rgba[0] + rgba[1] + rgba[2] != 0) {
            mouseDown = true;
            colorSelected(rgba[0], rgba[1], rgba[2])
            selectionCircle(mouseEvent.offsetX, mouseEvent.offsetY, rgba[0], rgba[1], rgba[2]);
        }

    });

    canvasEl.addEventListener('mouseup', function (mouseEvent) {
        mouseDown = false;
    });

    canvasEl.addEventListener('mouseout', function (mouseEvent) {
        mouseDown = false;
    });

    var pos = [256, 256];


    canvasEl.addEventListener('mousemove', function (mouseEvent) {
        if (mouseDown) {
            var imgData = context.getImageData(mouseEvent.offsetX, mouseEvent.offsetY, 1, 1);
            var rgba = imgData.data;
            var mouse_pos = [mouseEvent.offsetX, mouseEvent.offsetY]

            if (rgba[0] + rgba[1] + rgba[2] == 0) {
                if (mouse_pos[1] < points[1][1]) {
                    if (mouse_pos[0] < points[0][0]) {
                        pos = project(mouse_pos, points[0], points[1]);
                    } else {
                        pos = project(mouse_pos, points[0], points[5]);
                    }
                } else if (mouse_pos[1] > points[2][1]) {
                    if (mouse_pos[0] < points[0][0]) {
                        pos = project(mouse_pos, points[2], points[3]);
                    } else {
                        pos = project(mouse_pos, points[3], points[4]);
                    }
                } else {
                    if (mouse_pos[0] < points[1][0]) {
                        pos = project(mouse_pos, points[1], points[2]);
                    } else if (mouse_pos[0] > points[2][0]) {
                        pos = project(mouse_pos, points[4], points[5]);
                    }
                }
                imgData = context.getImageData(pos[0], pos[1], 1, 1);
                rgba = imgData.data;
            } else {
                pos = mouse_pos;
            }

            colorSelected(rgba[0], rgba[1], rgba[2]);
            selectionCircle(pos[0], pos[1], rgba[0], rgba[1], rgba[2]);
        }
    });
}


function colorSelected(r, g, b) {
    var canvasEL = document.getElementById('colorSelected');
    var context = canvasEL.getContext('2d');
    context.clearRect(0, 0, canvasEL.width, canvasEL.height);

    var radius = 64;

    context.beginPath();
    context.arc(105, 64, radius, 0, 2 * Math.PI, false);
    context.fillStyle = "rgb(" + r + "," + g + "," + b + ")";
    context.fill();

    context.font = '20pt Calibri';
    context.fillText("r : " + r, 193, 50);
    context.fillText("g : " + g, 191, 80);
    context.fillText("b : " + b, 190, 110);
}

function selectionCircle(x, y, r, g, b) {
    var canvasEL = document.getElementById('selectionCircle');
    var context = canvasEL.getContext('2d');
    context.clearRect(0, 0, canvasEL.width, canvasEL.height);

    context.beginPath();
    context.arc(x, y, 6, 0, 2 * Math.PI, false);
    context.lineWidth = 3;
    context.strokeStyle = '#000000';
    context.stroke();

    canvasEL.style.borderColor = "rgb(" + r + "," + g + "," + b + ")";
}

colorPicker();
colorSelected(256, 256, 256);
selectionCircle(160, 160, 256, 256, 256);