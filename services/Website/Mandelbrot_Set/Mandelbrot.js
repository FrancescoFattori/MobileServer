//HTML variables
//Canvas variables
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;
ctx.webkitImageSmoothingEnabled = false;
ctx.mozImageSmoothingEnabled = false;
var width = canvas.clientWidth;
var height = canvas.clientHeight;
canvas.width = width;
canvas.height = height;

var iterSlider = document.getElementById("iterSlider");

function convIterSlider() {
    iter = Math.floor(Math.pow((iterSlider.value - 1) / 50, 2) *
        (maxIter - 2) / 4.0 + 1);
}
iterSlider.oninput = function () {
    convIterSlider();
    draw();
}
var iterCheck = document.getElementById("iterCheck");
var juliaCheck = document.getElementById("juliaCheck");

function changeAutoIter() {
    autoIter = iterCheck.checked;
    if (!autoIter) {
        convIterSlider();
    }
    draw();
}

function changeJulia() {
    juliaSet = juliaCheck.checked;
    draw();
}
var realNumber = document.getElementById("real");
var imagNumber = document.getElementById("imag");

function updateJulia() {
    console.log(julia);
    julia.a = parseFloat(realNumber.value);
    julia.b = parseFloat(imagNumber.value);
    draw();
}

var realSlider = document.getElementById("realSlider");
realSlider.oninput = function () {
    julia.a = parseFloat(realSlider.value);
    realNumber.value = realSlider.value;
    draw();
}
var imagSlider = document.getElementById("imagSlider");
imagSlider.oninput = function () {
    julia.b = parseFloat(imagSlider.value);
    imagNumber.value = imagSlider.value;
    draw();
}
var coloringMode = 0;
var colorSelect = document.getElementById("colorSelect");

function changeColoring() {
    coloringMode = parseInt(colorSelect.value);
    draw();
}
var colours = new Array(255).fill({
    r: 0,
    g: 0,
    b: 0
});
for (i = 0; i < 255; i++) {
    if (i < 32) {
        r = i * 8;
        g = i * 8;
        b = 127 - i * 4;
    } else if (i < 128) {
        r = 255;
        g = 255 - (i - 32) * 8 / 3;
        b = (i - 32) * 4 / 3;
    } else if (i < 192) {
        r = 255 - (i - 128) * 4;
        g = 0 + (i - 128) * 3;
        b = 127 - (i - 128);
    } else {
        r = 0;
        g = 192 - (i - 192) * 3;
        b = 64 + (i - 192);
    }
    colours[i] = {
        r: r,
        g: g,
        b: b
    };
}
//-------------------------------
//Program variables
//Iterations
var juliaSet = false;
var julia = {
    a: 0,
    b: 0
};
var n = 2;
var maxIter = 1500;
var startIter = 30;
var iter = startIter;
var autoIter = false;
//Zone range
var startZone = [
    [-2.0, 2.0],
    [-1.5, 1.5]
];
var zone = [
    [-2.0, 2.0],
    [-1.5, 1.5]
];
//camera values
var pos = {
    x: 0,
    y: 0,
    x0: 0,
    y0: 0
};
var zoom = 1.0;
var zoomMultiplier = 1.3;
var zoomDivider = 1.0 - (zoomMultiplier - 1.0);
var maxZoom = 900000000000;
//thread variables
var draw2 = 0;
var draw1 = 0;
var draw05 = 0;
//mouse inputs
var mousePressed = false;
var mouseCoord = {
    x: 0,
    y: 0,
    x0: 0,
    y0: 0
};
//------------------------------------
//Functions
//function to calculate the zone range 
//based on camera position and zoom
function calcZone() {
    zone[0][0] = startZone[0][0] / zoom;
    zone[0][1] = startZone[0][1] / zoom;
    zone[1][0] = startZone[1][0] / zoom;
    zone[1][1] = startZone[1][1] / zoom;

    zone[0][0] += pos.x;
    zone[0][1] += pos.x;
    zone[1][0] += pos.y;
    zone[1][1] += pos.y;
}
//function to check if values are in canvas range
function inCanvas(a, b) {
    if (a > 0 && a < width &&
        b > 0 && b < height) {
        return true;
    }
    return false;
}
//function to handle mouse movement
function move(event) {
    mouseCoord.x = event.clientX - canvas.offsetLeft;
    mouseCoord.y = event.clientY - canvas.offsetTop;
    if (mousePressed) {
        if (inCanvas(mouseCoord.x, mouseCoord.y)) {
            pos.x = pos.x0 - (mouseCoord.x - mouseCoord.x0) / width * (startZone[0][1] - startZone[0][0]) / zoom;
            pos.y = pos.y0 + (mouseCoord.y - mouseCoord.y0) / height * (startZone[1][1] - startZone[1][0]) / zoom;
            calcZone();
            draw();
        }
    }
}
//function to handle mouse press
function mouseDown(event) {
    mousePressed = true;
    mouseCoord.x0 = event.clientX - canvas.offsetLeft;
    mouseCoord.y0 = event.clientY - canvas.offsetTop;
    if (inCanvas(mouseCoord.x0, mouseCoord.y0)) {
        pos.x0 = pos.x;
        pos.y0 = pos.y;
        return;
    }
    mouseCoord.x0 = mouseCoord.x;
    mouseCoord.x0 = mouseCoord.y;
}
//function to handle mouse release
function mouseUp() {
    mousePressed = false;
    mouseCoord.x0 = mouseCoord.x;
    mouseCoord.y0 = mouseCoord.y;
}
//function to handle mousewheel
function wheelZoom(event) {
    //event.preventDefault();
    if (event.deltaY * -0.01 >= 0) {
        zoom *= zoomMultiplier;
        //pos has to move compensating the 
        //zoomMultiplier shift
        let x = (mouseCoord.x - width / 2) / width * (startZone[0][1] - startZone[0][0]);
        let y = -(mouseCoord.y - height / 2) / height * (startZone[1][1] - startZone[1][0]);
        pos.x += (zoomMultiplier - 1.0) * x / zoom;
        pos.y += (zoomMultiplier - 1.0) * y / zoom;
    } else if (event.deltaY * -0.01 < 0) {
        zoom *= zoomDivider;
        //pos has to move compensating the 
        //zoomDivider shift
        let x = (mouseCoord.x - width / 2) / width * (startZone[0][1] - startZone[0][0]);
        let y = -(mouseCoord.y - height / 2) / height * (startZone[1][1] - startZone[1][0]);
        pos.x += (zoomDivider - 1.0) * x / zoom;
        pos.y += (zoomDivider - 1.0) * y / zoom;
    }
    calcZone();
    draw();
}
//adding windows events for mouse input
window.addEventListener('load', () => {
    document.addEventListener('mousemove', move);
    document.addEventListener('mousedown', mouseDown);
    document.addEventListener('mouseup', mouseUp);
    document.addEventListener('wheel', wheelZoom);
});

function multiply(z, q) {
    let real = z.a * q.a - z.b * q.b;
    let imag = z.a * q.b + z.b * q.a;
    return {
        a: real,
        b: imag
    };
}
//function to elevate complex numbers to the n
function elevate(z, n) {
    if (n == 2) {
        let real = z.a * z.a - z.b * z.b;
        let imag = 2 * z.a * z.b;
        return {
            a: real,
            b: imag
        };
    }
    let z0 = z;
    for (let i = 1; i < n; i++) {
        z = multiply(z, z0);
    }
    return z;
}

function calcMandel(ca, cb, iter) {
    let za = 0;
    let zb = 0;
    let za2 = 0;
    let zb2 = 0;
    let i = 0;
    while (za2 + zb2 <= 4 && i < iter) {
        za2 = za * za;
        zb2 = zb * zb;
        zb = 2 * za * zb + cb;
        za = za2 - zb2 + ca;
        i++;
    }
    return i;
}

function calcJulia(za, zb, ca, cb, iter) {
    let za2 = 0;
    let zb2 = 0;
    let i = 0;
    while (za2 + zb2 <= 4 && i < iter) {
        za2 = za * za;
        zb2 = zb * zb;
        zb = 2 * za * zb + cb;
        za = za2 - zb2 + ca;
        i++;
    }
    return i;
}

function color(col, n) {
    let r = 0;
    let g = 0;
    let b = 0;
    switch (n) {
        case 0:
            //Original
            r = colours[col % 255].r;
            g = colours[col % 255].g;
            b = colours[col % 255].b;
            if (col == iter) {
                r = 0;
                g = 0;
                b = 0;
            }
            break;
        case 1:
            //Ivan
            r = (2 * col);
            g = (7 * col);
            b = (11 * col);
            let counterR = 0;
            let counterG = 0;
            let counterB = 0;
            while (r > 255) {
                r -= 255;
                counterR++;
            }
            if (counterR % 2 == 1) {
                r = 256 - r;
            }
            while (g > 255) {
                g -= 255;
                counterG++;
            }
            if (counterG % 2 == 1) {
                g = 254 - g;
            }
            while (b > 255) {
                b -= 255;
                counterB++;
            }
            if (counterB % 2 == 1) {
                b = 255 - b;
            }
            if (col == iter) {
                r = 0;
                g = 0;
                b = 0;
            }
            break;
    }
    return {
        r: r,
        g: g,
        b: b
    };
}

//function that draws the Mandelbrot set given 
//a zone range and resolution
function drawSet(x0, y0, x1, y1, res) {
    let imageData = ctx.createImageData(width / res, height / res);
    let w = imageData.width; let h = imageData.height;
    let xRange = x1 - x0;
    let yRange = y1 - y0;
    //go forward
    for (let row = 0; row < h; row++) {
        for (let column = 0; column < w; column++) {
            let x = x0 + xRange / width * res * column;
            let y = y1 - yRange / height * res * row;
            let col = iter;
            if (!juliaSet) {
                col = calcMandel(x, y, iter);
            } else {
                col = calcJulia(x, y, julia.a, julia.b, iter);
            }
            let i = 4 * (row * w + column);
            let c = color(col, coloringMode);
            imageData.data[i] = c.r;
            imageData.data[i + 1] = c.g;
            imageData.data[i + 2] = c.b;
            imageData.data[i + 3] = 255;
        }
    }
    ctx.clearRect(0, 0, width, height);
    createImageBitmap(imageData).then(function (imgBitmap) {
        ctx.drawImage(imgBitmap, 0, 0, width, height);
    });
}
//draw function
function draw() {
    //stop calculating previous frames
    clearTimeout(draw2);
    clearTimeout(draw1);
    clearTimeout(draw05);
    //checks
    if (zoom > maxZoom) {
        zoom = maxZoom;
    }
    if (autoIter) {
        iter = Math.floor(startIter * Math.pow(zoom, 1.0 / 3.0));
        if (iter > maxIter) {
            iter = maxIter;
        }
    }
    //save some variables giving short names to ease things
    let x0 = zone[0][0];
    let x1 = zone[0][1];
    let y0 = zone[1][0];
    let y1 = zone[1][1];
    //check if the zone range is valid
    if (x1 < x0 || y1 < y0) {
        console.log("Zone Error!", zoom);
        return;
    }
    setTimeout(drawSet, 0, x0, y0, x1, y1, 8);
    draw2 = setTimeout(drawSet, 1.25 * Math.pow(iter, 0.66), x0, y0, x1, y1, 2);
    draw1 = setTimeout(drawSet, 2.5 * Math.pow(iter, 0.66), x0, y0, x1, y1, 1);
    draw05 = setTimeout(drawSet, 5.5 * Math.pow(iter, 0.66), x0, y0, x1, y1, 0.5);
}
//---------------------------
//user inputs

function up() {
    pos.y += 1.0 / 3 / zoom;
    calcZone();
    draw();
}

function left() {
    pos.x -= 1.0 / 3 / zoom;
    calcZone();
    draw();
}

function right() {
    pos.x += 1.0 / 3 / zoom;
    calcZone();
    draw();
}

function down() {
    pos.y -= 1.0 / 3 / zoom;
    calcZone();
    draw();
}

function zoomUp() {
    zoom *= zoomMultiplier;
    calcZone();
    draw();
}

function zoomDown() {
    zoom *= zoomDivider;
    calcZone();
    draw();
}

function reset() {
    zoom = 1.0;
    pos.x = 0;
    pos.y = 0;
    iter = startIter;
    zone[0][0] = startZone[0][0];
    zone[0][1] = startZone[0][1];
    zone[1][0] = startZone[1][0];
    zone[1][1] = startZone[1][1];
    draw();
}
