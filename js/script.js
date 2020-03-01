//global variables
var rgb = {
    r: 256,
    g: 256,
    b: 256
}

//palette
var lastClicked;
var grid = clickableGrid(24, 10, function (el, row, col, i) {
    console.log("You clicked on element:", el);
    console.log("You clicked on row:", row);
    console.log("You clicked on col:", col);
    console.log("You clicked on item #:", i);

    el.className = 'clicked';
    el.style.backgroundColor = "rgb(" + rgb.r + "," + rgb.g + "," + rgb.b + ")";
    // if (lastClicked) lastClicked.className = '';
    // lastClicked = el;
});

document.body.appendChild(grid);

function clickableGrid(rows, cols, callback) {
    var i = 0;
    var grid = document.createElement('table');
    grid.bgColor = "#000000";
    grid.className = 'grid';
    for (var r = 0; r < rows; ++r) {
        var tr = grid.appendChild(document.createElement('tr'));
        for (var c = 0; c < cols; ++c) {
            var cell = tr.appendChild(document.createElement('td'));
            //cell.innerHTML = ++i;
            cell.addEventListener('click', (function (el, r, c, i) {
                return function () {
                    callback(el, r, c, i);
                }
            })(cell, r, c, i), false);
        }
    }
    return grid;
}

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


//sound stuff
var sineWave = new Pizzicato.Sound({
    source: 'wave',
    options: {
        type: 'sine',
        frequency: 440
    }
});


var squareWave = new Pizzicato.Sound({
    source: 'wave',
    options: {
        type: 'square',
        frequency: 440
    }
});

var triangleWave = new Pizzicato.Sound({
    source: 'wave',
    options: {
        type: 'triangle',
        frequency: 440
    }
});

var soundGroup = new Pizzicato.Group([sineWave, squareWave, triangleWave]);
var volume = 0.1;
soundGroup.volume = volume;


//graphic and input stuff
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
        rgb.r = imgData.data[0];
        rgb.g = imgData.data[1];
        rgb.b = imgData.data[2];

        if (rgb.r + rgb.g + rgb.b != 0) {
            mouseDown = true;
            colorSelected(rgb.r, rgb.g, rgb.b)
            selectionCircle(mouseEvent.offsetX, mouseEvent.offsetY, rgb.r, rgb.g, rgb.b);

            sineWave.volume = rgb.r / (rgb.r + rgb.g + rgb.b);
            squareWave.volume = rgb.g / (rgb.r + rgb.g + rgb.b);
            triangleWave.volume = rgb.b / (rgb.r + rgb.g + rgb.b);
            soundGroup.play();
        }

    });

    canvasEl.addEventListener('mouseup', function (mouseEvent) {
        mouseDown = false;
        soundGroup.stop();
    });

    canvasEl.addEventListener('mouseout', function (mouseEvent) {
        mouseDown = false;
        soundGroup.stop();
    });

    var pos = [256, 256];


    canvasEl.addEventListener('mousemove', function (mouseEvent) {
        if (mouseDown) {
            var imgData = context.getImageData(mouseEvent.offsetX, mouseEvent.offsetY, 1, 1);
            rgb.r = imgData.data[0];
            rgb.g = imgData.data[1];
            rgb.b = imgData.data[2];
            var mouse_pos = [mouseEvent.offsetX, mouseEvent.offsetY]

            if (rgb.r + rgb.g + rgb.b == 0) {
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
                rgb.r = imgData.data[0];
                rgb.g = imgData.data[1];
                rgb.b = imgData.data[2];
            } else {
                pos = mouse_pos;
            }

            colorSelected(rgb.r, rgb.g, rgb.b)
            selectionCircle(pos[0], pos[1], rgb.r, rgb.g, rgb.b);

            sineWave.volume = rgb.r / (rgb.r + rgb.g + rgb.b);
            squareWave.volume = rgb.g / (rgb.r + rgb.g + rgb.b);
            triangleWave.volume = rgb.b / (rgb.r + rgb.g + rgb.b);
        }
    });
}


function colorSelected() {
    var canvasEL = document.getElementById('colorSelected');
    var context = canvasEL.getContext('2d');
    context.clearRect(0, 0, canvasEL.width, canvasEL.height);

    var radius = 64;

    context.beginPath();
    context.arc(105, 64, radius, 0, 2 * Math.PI, false);
    context.fillStyle = "rgb(" + rgb.r + "," + rgb.g + "," + rgb.b + ")";
    context.fill();

    context.font = '20pt Calibri';
    context.fillText("r : " + rgb.r, 193, 50);
    context.fillText("g : " + rgb.g, 191, 80);
    context.fillText("b : " + rgb.b, 190, 110);
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

    canvasEL.style.borderColor = "rgb(" + rgb.r + "," + rgb.g + "," + rgb.b + ")";
}


//function calling
colorPicker();
colorSelected();
selectionCircle(160, 160);


