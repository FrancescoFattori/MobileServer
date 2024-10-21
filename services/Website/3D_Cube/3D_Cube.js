var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var width = canvas.clientWidth;
var height = canvas.clientHeight;
canvas.width = width;
canvas.height = height;
ctx.strokeStyle = "white";
ctx.lineWidth = 2;

var values = document.getElementById("values");



var vertices = [
    { x: -1, y: -1, z: -1 },
    { x: -1, y: 1, z: -1 },
    { x: 1, y: 1, z: -1 },
    { x: 1, y: -1, z: -1 },

    { x: -1, y: -1, z: 1 },
    { x: -1, y: 1, z: 1 },
    { x: 1, y: 1, z: 1 },
    { x: 1, y: -1, z: 1 }
];
var quaternion = {};
var vector = { x: 1, y: 1, z: 0 };
var angle = 0;
var perp = 7;

setInterval(draw, 30);

function draw() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = "white";
    let projVertices = [];
    let z = [];
    if (angle >= 360) {
        angle = 0;
    }
    angle += 1;
    vector.x += vector.y/200;
    vector.y += vector.z/100;
    vector.z -= vector.x/300;
    vector = normalize(vector);
    for (let i = 0; i < 8; i++) {
        let vertex = rotate(vertices[i], vector, angle);
        z.push(vertex.z);
        let projVertex = project(vertex);
        let xCoord = (projVertex.x + 2) / 4 * width;
        let yCoord = (1 - (projVertex.y + 2) / 4) * height;
        projVertices.push({ x: xCoord, y: yCoord });
    }
    let order = orderFaces(z);
    drawFaces(projVertices, order);
    values.innerHTML = "Quaternion:&nbsp&nbsp" +
        parseFloat(quaternion.r).toFixed(3) + " + " + parseFloat(quaternion.i).toFixed(3) + "i + " +
        parseFloat(quaternion.j).toFixed(3) + "j + " + parseFloat(quaternion.k).toFixed(3) + "k" +
        "<br>Axis of Rotation:&nbsp&nbspx: " + parseFloat(vector.x).toFixed(3) +
        " ,  y: " + parseFloat(vector.y).toFixed(3) + " , z: " + parseFloat(vector.z).toFixed(3) +
        "<br>Angle:&nbsp&nbsp" + angle + "°";
}

//function to draw the edges of the cube
function drawEdges(vert) {
    ctx.beginPath();
    ctx.moveTo(vert[0].x, vert[0].y);
    ctx.lineTo(vert[1].x, vert[1].y);
    ctx.lineTo(vert[2].x, vert[2].y);
    ctx.lineTo(vert[3].x, vert[3].y);
    ctx.lineTo(vert[0].x, vert[0].y);
    ctx.moveTo(vert[4].x, vert[4].y);
    ctx.lineTo(vert[5].x, vert[5].y);
    ctx.lineTo(vert[6].x, vert[6].y);
    ctx.lineTo(vert[7].x, vert[7].y);
    ctx.lineTo(vert[4].x, vert[4].y);
    ctx.lineTo(vert[0].x, vert[0].y);
    ctx.moveTo(vert[5].x, vert[5].y);
    ctx.lineTo(vert[1].x, vert[1].y);
    ctx.moveTo(vert[6].x, vert[6].y);
    ctx.lineTo(vert[2].x, vert[2].y);
    ctx.moveTo(vert[7].x, vert[7].y);
    ctx.lineTo(vert[3].x, vert[3].y);
    ctx.stroke();
}

//function to draw the faces of the cube
function drawFaces(vert, order) {
    drawFace(vert, order[0]);
    drawFace(vert, order[1]);
    drawFace(vert, order[2]);
    drawFace(vert, order[3]);
    drawFace(vert, order[4]);
    drawFace(vert, order[5]);
}

//function to draw a face
function drawFace(vert, n) {
    switch (n) {
        case 0:
            ctx.fillStyle = "red";
            ctx.beginPath();
            ctx.moveTo(vert[0].x, vert[0].y);
            ctx.lineTo(vert[1].x, vert[1].y);
            ctx.lineTo(vert[2].x, vert[2].y);
            ctx.lineTo(vert[3].x, vert[3].y);
            ctx.fill();
            break;
        case 1:
            ctx.fillStyle = "blue";
            ctx.beginPath();
            ctx.moveTo(vert[2].x, vert[2].y);
            ctx.lineTo(vert[3].x, vert[3].y);
            ctx.lineTo(vert[7].x, vert[7].y);
            ctx.lineTo(vert[6].x, vert[6].y);
            ctx.fill();
            break;
        case 2:
            ctx.fillStyle = "red";
            ctx.beginPath();
            ctx.moveTo(vert[4].x, vert[4].y);
            ctx.lineTo(vert[5].x, vert[5].y);
            ctx.lineTo(vert[6].x, vert[6].y);
            ctx.lineTo(vert[7].x, vert[7].y);
            ctx.fill();
            break;
        case 3:
            ctx.fillStyle = "blue";
            ctx.beginPath();
            ctx.moveTo(vert[0].x, vert[0].y);
            ctx.lineTo(vert[1].x, vert[1].y);
            ctx.lineTo(vert[5].x, vert[5].y);
            ctx.lineTo(vert[4].x, vert[4].y);
            ctx.fill();
            break;
        case 4:
            ctx.fillStyle = "green";
            ctx.beginPath();
            ctx.moveTo(vert[1].x, vert[1].y);
            ctx.lineTo(vert[2].x, vert[2].y);
            ctx.lineTo(vert[6].x, vert[6].y);
            ctx.lineTo(vert[5].x, vert[5].y);
            ctx.fill();
            break;
        case 5:
            ctx.fillStyle = "green";
            ctx.beginPath();
            ctx.moveTo(vert[0].x, vert[0].y);
            ctx.lineTo(vert[3].x, vert[3].y);
            ctx.lineTo(vert[7].x, vert[7].y);
            ctx.lineTo(vert[4].x, vert[4].y);
            ctx.fill();
            break;
    }
}

//function to calculate order of faces
function orderFaces(z) {
    let F = [
        { f: 0, v: z[0] + z[2] },
        { f: 1, v: z[2] + z[7] },
        { f: 2, v: z[4] + z[6] },
        { f: 3, v: z[0] + z[5] },
        { f: 4, v: z[1] + z[6] },
        { f: 5, v: z[4] + z[3] }
    ];
    while (
        F[0].v < F[1].v ||
        F[1].v < F[2].v ||
        F[2].v < F[3].v ||
        F[3].v < F[4].v ||
        F[4].v < F[5].v
    ) {
        for (let i = 0; i < 5; i++) {
            if (F[i].v < F[i + 1].v) {
                let f = F[i];
                F[i] = F[i + 1];
                F[i + 1] = f;
            }
        }
    }
    return [F[0].f, F[1].f, F[2].f, F[3].f, F[4].f, F[5].f];
}

//function to project a 3d point on 2d canvas
function project(vert) {
    let projx = vert.x - vert.z * vert.x / perp;
    let projy = vert.y - vert.z * vert.y / perp;
    return { x: projx, y: projy };
}

//function to normalize a vector
function normalize(v) {
    let m = mag(v);
    return { x: v.x / m, y: v.y / m, z: v.z / m };
}

//function to find the magnitude of a vector3
function mag(v) {
    return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
}

//function to multiply quaternions
function multiply(q1, q2) {
    return {
        r: q1.r * q2.r - q1.i * q2.i - q1.j * q2.j - q1.k * q2.k,
        i: q1.r * q2.i + q1.i * q2.r + q1.j * q2.k - q1.k * q2.j,
        j: q1.r * q2.j - q1.i * q2.k + q1.j * q2.r + q1.k * q2.i,
        k: q1.r * q2.k + q1.i * q2.j - q1.j * q2.i + q1.k * q2.r
    };
}

//function that returns a quaternion conjugate
function conj(q) {
    return {
        r: q.r,
        i: -q.i,
        j: -q.j,
        k: -q.k
    };
}

//function to rotate a vertex
function rotate(vert, axis, angle) {
    let angleR = angle * Math.PI / 180;
    let p = { r: 0, i: vert.x, j: vert.y, k: vert.z };
    let q = {
        r: Math.cos(angleR / 2),
        i: axis.x * Math.sin(angleR / 2),
        j: axis.y * Math.sin(angleR / 2),
        k: axis.z * Math.sin(angleR / 2)
    };
    quaternion = q;
    let q1 = conj(q);
    let h = multiply(q, p);
    h = multiply(h, q1);
    return { x: h.i, y: h.j, z: h.k };
}

