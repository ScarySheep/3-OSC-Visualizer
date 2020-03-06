//global variables
var rgb = {
    r: 256,
    g: 256,
    b: 256
}

var scores = [];
var notes = [];

// create web audio api context
var audioCtx;

// create Oscillator node
var selectedSineWave;
var selectedSquareWave;
var selectedTriangleWave;
var selectedSineGainNode;
var selectedSquareGainNode;
var selectedTriangleGainNode;

var mainVolume = 0.1;

function initSelectedSounds() {
    // create web audio api context
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    selectedSineGainNode = audioCtx.createGain();
    selectedSquareGainNode = audioCtx.createGain();
    selectedTriangleGainNode = audioCtx.createGain();
    selectedSineGainNode.connect(audioCtx.destination);
    selectedSquareGainNode.connect(audioCtx.destination);
    selectedTriangleGainNode.connect(audioCtx.destination);

    createSelectedSound();
}

function createSelectedSound() {
    // create Oscillator node
    selectedSineWave = audioCtx.createOscillator();
    selectedSquareWave = audioCtx.createOscillator();
    selectedTriangleWave = audioCtx.createOscillator();

    selectedSineWave.type = 'sine';
    selectedSineWave.frequency.setValueAtTime(440, audioCtx.currentTime); // value in hertz
    selectedSineWave.connect(selectedSineGainNode);

    selectedSquareWave.type = 'square';
    selectedSquareWave.frequency.setValueAtTime(440, audioCtx.currentTime); // value in hertz
    selectedSquareWave.connect(selectedSquareGainNode);

    selectedTriangleWave.type = 'triangle';
    selectedTriangleWave.frequency.setValueAtTime(440, audioCtx.currentTime); // value in hertz
    selectedTriangleWave.connect(selectedTriangleGainNode);
}

function playSelectedSound() {
    createSelectedSound();
    selectedSineWave.start();
    selectedSquareWave.start();
    selectedTriangleWave.start();
}

function stopSelectedSound() {
    selectedSineWave.stop();
    selectedSquareWave.stop();
    selectedTriangleWave.stop();
}

function selectedSoundVolume(r, g, b) {
    selectedSineGainNode.gain.setValueAtTime(r / (r + g + b) * mainVolume, audioCtx.currentTime);
    selectedSquareGainNode.gain.setValueAtTime(g / (r + g + b) * mainVolume, audioCtx.currentTime);
    selectedTriangleGainNode.gain.setValueAtTime(b / (r + g + b) * mainVolume, audioCtx.currentTime);
}

//mix and play the sound from stored data
function playSound() {
    //create all the required sound
    //calculate the volume
    //get all the frequency info
    for (let notes of scores) {
        var processedNotes = [];
        for (var i = 0; i < notes.length - 1; i++) {
            var d_y = (notes[i + 1].y - notes[i].y) / (notes[i + 1].x - notes[i].x);
            for (var j = 0; j < (notes[i + 1].x - notes[i].x); j++) {
                var p = notes[i].y + d_y * j;
                //pixel to frequency conversion
                var f = 440 * (Math.pow((Math.pow(2, 1 / 12)), (375 - p) / 30));
                processedNotes.push(f);
            }
        }
        processedNotes.push(notes[notes.length - 1].y);
        var sound = new Sound(notes[0].color.r, notes[0].color.g, notes[0].color.b, scores.length, processedNotes, notes[0].x, 0);
        setTimeSounds(sound);
    }

}

function setTimeSounds(sound) {
    setTimeout(function () {
        sound.play();
        sound.inId = setInterval(function () {
            sound.changeFrequency();
        }, 1);
    }, sound.startTime);

}

function Sound(r, g, b, total, n, startTime, id) {
    console.log(n);
    var r_sound = new Pizzicato.Sound({
        source: 'wave',
        options: {
            type: 'sine',
            frequency: 440
        }
    });
    var g_sound = new Pizzicato.Sound({
        source: 'wave',
        options: {
            type: 'square',
            frequency: 440
        }
    });
    var b_sound = new Pizzicato.Sound({
        source: 'wave',
        options: {
            type: 'triangle',
            frequency: 440
        }
    });

    r_sound.frequency = n[0];
    g_sound.frequency = n[0];
    b_sound.frequency = n[0];
    this.startTime = startTime;

    r_sound.volume = r / (r + g + b) / total;
    g_sound.volume = g / (r + g + b) / total;
    b_sound.volume = b / (r + g + b) / total;

    this.play = function () {
        r_sound.play();
        g_sound.play();
        b_sound.play();
    }

    var counter = 0;
    this.inId = id;
    var self = this;

    this.changeFrequency = function () {
        if (counter < n.length - 1) {
            console.log(counter);
            counter++;
            r_sound.frequency = n[counter];
            g_sound.frequency = n[counter];
            b_sound.frequency = n[counter];
        } else {
            clearInterval(self.inId);
            r_sound.stop();
            g_sound.stop();
            b_sound.stop();
        }
    };
}

//cut all notes to right orientation
function orderingNotes() {
    let newScores = [];
    for (let notes of scores) {
        var l = notes.length;
        var i = 0;
        var tmp_pos = true;
        var positive = true;
        var last_cut = 0;

        while (i < l - 1) {
            if (notes[i].x >= notes[i + 1].x) {
                positive = false;
            } else {
                positive = true;
            }

            if (positive != tmp_pos) {
                if (i != last_cut) {
                    var arr = notes.slice(last_cut, i + 1);
                    if (arr[0].x >= arr[1].x) {
                        arr.reverse();
                    }
                    newScores.push(arr);
                    last_cut = i;
                }
            }
            tmp_pos = positive;
            i++;
        }
        var arr = notes.slice(last_cut, i + 1);
        if (arr[0].x >= arr[1].x) {
            arr.reverse();
        }
        newScores.push(arr);
    }
    scores = newScores;
}

//palette
function drawNotes(context, notes) {
    context.lineWidth = 3;
    context.strokeStyle = "rgb(" + notes[0].color.r + "," + notes[0].color.g + "," + notes[0].color.b + ")";
    context.beginPath();
    context.moveTo(notes[0].x, notes[0].y);
    for (var note of notes) {
        context.lineTo(note.x, note.y);
    }
    context.stroke();
    context.closePath();
}


function drawing() {
    var startDrawing = false;
    var canvasEl = document.getElementById('palette');
    var context = canvasEl.getContext('2d');

    canvasEl.addEventListener('mousedown', function (mouseEvent) {
        if (mouseEvent.buttons == 1) {
            var note = { x: mouseEvent.offsetX, y: mouseEvent.offsetY, color: { r: rgb.r, g: rgb.g, b: rgb.b } };
            if (!startDrawing) {
                startDrawing = true;
                notes = [];
            }
            notes.push(note);
        }
    });

    canvasEl.addEventListener('mousemove', function (mouseEvent) {
        if (startDrawing) {
            context.clearRect(0, 0, canvasEl.width, canvasEl.height);
            //let to make notes local in for because I'm lazy to just change the name
            //here we draw the old lines
            for (let notes of scores) {
                drawNotes(context, notes);
            }
            //here we draw the current line
            var note = { x: mouseEvent.offsetX, y: mouseEvent.offsetY, color: { r: rgb.r, g: rgb.g, b: rgb.b } };
            notes.push(note);
            drawNotes(context, notes);
            notes.pop();
        }
    });

    canvasEl.addEventListener('contextmenu', function (e) {
        e.preventDefault();
        if (startDrawing) {
            startDrawing = false;
            if (notes.length != 1) {
                scores.push(notes);
            }
            //console.log(scores);
            context.clearRect(0, 0, canvasEl.width, canvasEl.height);
            for (let notes of scores) {
                drawNotes(context, notes);
            }
            orderingNotes();
        }
    }, false);
}

//graphic and input stuff
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
        rgb.r = imgData.data[0];
        rgb.g = imgData.data[1];
        rgb.b = imgData.data[2];

        if (rgb.r + rgb.g + rgb.b != 0) {
            mouseDown = true;
            colorSelected(rgb.r, rgb.g, rgb.b)
            selectionCircle(mouseEvent.offsetX, mouseEvent.offsetY, rgb.r, rgb.g, rgb.b);

            selectedSoundVolume(rgb.r, rgb.g, rgb.b);
            playSelectedSound();
        }

    });

    canvasEl.addEventListener('mouseup', function (mouseEvent) {
        mouseDown = false;
        stopSelectedSound();
    });

    canvasEl.addEventListener('mouseout', function (mouseEvent) {
        mouseDown = false;
        stopSelectedSound();
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

            selectedSoundVolume(rgb.r, rgb.g, rgb.b);
        }
    });

    canvasEl.addEventListener('contextmenu', function (e) {
        e.preventDefault();
    }, false);
}

function colorSelected() {
    var canvasEl = document.getElementById('colorSelected');
    var context = canvasEl.getContext('2d');
    context.clearRect(0, 0, canvasEl.width, canvasEl.height);

    var radius = 64;

    context.beginPath();
    context.arc(105, 64, radius, 0, 2 * Math.PI, false);
    context.fillStyle = "rgb(" + rgb.r + "," + rgb.g + "," + rgb.b + ")";
    context.fill();

    context.font = '20pt Calibri';
    context.fillText("r : " + rgb.r, 193, 50);
    context.fillText("g : " + rgb.g, 191, 80);
    context.fillText("b : " + rgb.b, 190, 110);

    canvasEl.addEventListener('contextmenu', function (e) {
        e.preventDefault();
    }, false);
}

function selectionCircle(x, y) {
    var canvasEl = document.getElementById('selectionCircle');
    var context = canvasEl.getContext('2d');
    context.clearRect(0, 0, canvasEl.width, canvasEl.height);

    context.beginPath();
    context.arc(x, y, 6, 0, 2 * Math.PI, false);
    context.lineWidth = 3;
    context.strokeStyle = '#000000';
    context.stroke();

    canvasEl.style.borderColor = "rgb(" + rgb.r + "," + rgb.g + "," + rgb.b + ")";

    canvasEl.addEventListener('contextmenu', function (e) {
        e.preventDefault();
    }, false);
}

function startApp() {
    document.getElementById("popUp").style.display = "none";

    //function calling
    initSelectedSounds();
    colorPicker();
    colorSelected();
    selectionCircle(160, 160);
    drawing();
}


