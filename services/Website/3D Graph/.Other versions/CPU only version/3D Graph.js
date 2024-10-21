var canvas = document.getElementById("canvas");
var width = canvas.clientWidth; var height = canvas.clientHeight; canvas.width = width; canvas.height = height;
var ctx = canvas.getContext("2d"); ctx.imageSmoothingEnabled = false; ctx.webkitImageSmoothingEnabled = false; ctx.mozImageSmoothingEnabled = false;
var res = 1; var fov = (width + height) / 2; var maxIter = 100;
var camera = { x: 0, y: -5, z: 0, a: 0, zoom: 1 }; var lightDir = N({ x: 0, y: 0, z: -1 });
var w = Math.floor(width / res + 0.5); var h = Math.floor(height / res + 0.5);

function mag(vec) {
    return Math.sqrt(vec.x * vec.x + vec.y * vec.y + vec.z * vec.z);
}
function N(vec) {
    let m = mag(vec);
    if (m != 0) {
        return { x: vec.x / m, y: vec.y / m, z: vec.z / m };
    }
    return undefined;
}
function dist(vec1, vec2) {
    return Math.sqrt(Math.pow(vec1.x - vec2.x, 2) + Math.pow(vec1.y - vec2.y, 2) + Math.pow(vec1.z - vec2.z, 2));
}
function genRay(i, j) {
    let x = i - w / 2;
    let z = j - h / 2;
    let y = fov / res * camera.zoom;
    let cos = Math.cos(camera.a / 180 * Math.PI);
    let sin = Math.sin(camera.a / 180 * Math.PI);
    let yR = y * cos - z * sin;
    let zR = y * sin + z * cos;
    return N({ x: x, y: yR, z: zR });
}
function f(x, y, z) {
    return x * x + y * y + z * z - 1;
    return -1 / Math.sqrt(x * x + y * y) - z;
    return z * z + Math.pow(Math.sqrt(x * x + y * y) - 2, 2) - 1;
}
function movePoint(p, dir, val) {
    p.x += dir.x * val;
    p.y += dir.y * val;
    p.z += dir.z * val;
}
function calcNormal(p) {
    let d = 0.01;
    let x = p.x; let y = p.y; let z = p.z;
    let dX = f(x + d, y, z) - f(x - d, y, z);
    let dY = f(x, y + d, z) - f(x, y - d, z);
    let dZ = f(x, y, z + d) - f(x, y, z - d);
    return N({ x: dX, y: dY, z: dZ });
}
function calcP(dir) {
    let p = { x: camera.x, y: camera.y, z: -camera.z };
    let d = 0.1;
    for (let i = 0; i < maxIter; i++) {
        let v = f(p.x, p.y, p.z);
        if (Math.abs(v < d)) { return p; }
        movePoint(p, dir, d);
    }
    return undefined;
}
function drawFrame() {
    ctx.fillRect(0, 0, width, height);
    let imageData = ctx.createImageData(w, h);
    let data = imageData.data;
    for (let i = 0; i < w; i++) {
        for (let j = 0; j < h; j++) {
            let dir = genRay(i, j);
            let p = calcP(dir);
            if (!p) { continue; }
            let normal = calcNormal(p);
            let col = 30 + 150 * Math.max(0, normal.x * lightDir.x + normal.y * lightDir.y + normal.z * lightDir.z);
            let index = (i + j * w) * 4;
            data[index + 0] = col;
            data[index + 1] = col;
            data[index + 2] = col;
            data[index + 3] = 255;
        }
    }
    createImageBitmap(imageData).then(function (imgBitmap) {
        ctx.drawImage(imgBitmap, 0, 0, width, height);
    });
}
function loop() {
    setInterval(() => {
        drawFrame();
        camera.y += 0.1;
        camera.a += 0.75;
    }, 10);
}

//loop();
drawFrame();