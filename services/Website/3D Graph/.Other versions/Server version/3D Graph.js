//WebGL
var canvas = document.getElementById("canvas"); var width = canvas.clientWidth; var height = canvas.clientHeight; canvas.width = width; canvas.height = height;
window.onresize = () => { width = canvas.clientWidth; height = canvas.clientHeight; canvas.width = width; canvas.height = height; }
var gl = canvas.getContext("webgl"); if (!gl) { throw new Error("WebGL not supported!"); }
//HTML
var htmlFps = document.getElementById("fps");
var htmlStepLabel = document.getElementById("stepLabel"); var htmlMaxIterLabel = document.getElementById("maxIterLabel"); var htmlPrecisionLabel = document.getElementById("precisionLabel");
var htmlStep = document.getElementById("step"); var htmlPrecision = document.getElementById("precision");
function updatePrecision() {
    precision = htmlPrecision.value; d = htmlStep.value; maxIter = 10.0 / d;
    htmlStepLabel.innerHTML = 'step = ' + parseFloat(d).toFixed(3);
    htmlMaxIterLabel.innerHTML = '&nbsp&nbsp&nbspmaxIter = ' + parseFloat(maxIter).toFixed(0);
    htmlPrecisionLabel.innerHTML = 'precision = ' + parseFloat(precision).toFixed(4);
}
//Variables
var d = 0.1; var maxIter = 10.0 / d; var precision = 0.1;
//WebGL functions
function loadShader(src, type) {
    let shader = gl.createShader(type);
    gl.shaderSource(shader, src);
    gl.compileShader(shader);
    return shader;
}
function createProgram(vertexShader, fragmentShader) {
    let program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    return program;
}
function setUpParameters(program) {
    l_resolution = gl.getUniformLocation(program, "u_resolution");
    l_parameters = gl.getUniformLocation(program, "parameters");
    l_cameraPosition = gl.getUniformLocation(program, "c_position");
    l_cameraOffset = gl.getUniformLocation(program, "c_offset");
    l_cameraRotation = gl.getUniformLocation(program, "c_rotation");
    l_cameraZoom = gl.getUniformLocation(program, "zoom");
    l_variables = gl.getUniformLocation(program, "variables");
}
function updateParameters() {
    let position = calcCameraPosition();
    gl.uniform2f(l_resolution, gl.canvas.width, gl.canvas.height);
    gl.uniform3f(l_parameters, d, maxIter, precision);
    gl.uniform3f(l_cameraOffset, camera.offset.x, camera.offset.y, camera.offset.z);
    gl.uniform3f(l_cameraPosition, position.x, position.y, position.z);
    gl.uniform2f(l_cameraRotation, camera.rotation.a, camera.rotation.b);
    gl.uniform1f(l_cameraZoom, camera.zoom);
    gl.uniform1fv(l_variables, variables);
}
function bindBuffer(buffer, program, data) {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.DYNAMIC_DRAW);
    let positionLocation = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);
}
//Logic functions
function setupWebGL() {
    raymarchBuffer = gl.createBuffer(); linesBuffer = gl.createBuffer();
    vertexShader = loadShader(vertexShaderSource, gl.VERTEX_SHADER);
    buildRaymarchShader("pow(x,4.0)+pow(y,4.0)+pow(z,4.0)-1.0");
    let linesFragmentShader = loadShader(linesFragmentShaderSource, gl.FRAGMENT_SHADER);
    linesProgram = createProgram(vertexShader, linesFragmentShader);
}
function buildRaymarchShader(formula) {
    let fragmentShaderSource = fragmentShaderSourceStart + formula + fragmentShaderSourceEnd;
    let fragmentShader = loadShader(fragmentShaderSource, gl.FRAGMENT_SHADER);
    raymarchProgram = createProgram(vertexShader, fragmentShader);
    setUpParameters(raymarchProgram);
}
function calcCameraPosition() {
    let xO = camera.offset.x; let yO = camera.offset.y; let zO = camera.offset.z;
    let r = camera.rotation.r; let a = -camera.rotation.a; let b = camera.rotation.b + Math.PI / 2;
    let x = xO - r * Math.sin(b) * Math.cos(a);
    let y = yO + r * Math.sin(b) * Math.sin(a);
    let z = zO + r * Math.cos(b);
    return { x: x, y: y, z: z };
}
function rotateSpherical(x, y, z, a, b) {//webgl axis system
    //think about it...
}
function calcOrigin() {
    //let m = (width + height) / 2.0;
    let l = 0.25;
    let x = rotateSpherical(l, 0, 0, camera.rotation.a, camera.rotation.b);
    let y = rotateSpherical(0, l, 0, camera.rotation.a, camera.rotation.b);
    let z = rotateSpherical(0, 0, l, camera.rotation.a, camera.rotation.b);
    origin = [
        0, 0, 0,
        x.x, y.y, x.z,
        0, 0, 0,
        y.x, y.y, y.z,
        0, 0, 0,
        z.x, z.y, z.z
    ];
}
function draw() {
    fps = 1000 / (performance.now() - time); time = performance.now();
    //Draw Raymarch
    bindBuffer(raymarchBuffer, raymarchProgram, canvasVertices);
    gl.useProgram(raymarchProgram);
    updateParameters();
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    //Draw Lines
    /*calcOrigin();
    bindBuffer(linesBuffer, linesProgram, origin);
    gl.useProgram(linesProgram);
    gl.drawArrays(gl.LINES, 0, 2);*/
    window.requestAnimationFrame(draw);
}
//Camera and Precision settings
var camera = {
    offset: { x: 0, y: 0, z: 0 },
    rotation: { r: 5, a: 0, b: -Math.PI / 4 },
    zoom: 1
};
var raymarchProgram; var linesProgram; var vertexShader; var raymarchBuffer; var linesBuffer;
var canvasVertices = [
    -1, -1, 0,
    -1, 1, 0,
    1, 1, 0,
    -1, -1, 0,
    1, -1, 0,
    1, 1, 0,
];
var origin = [];
var time = performance.now(); var fps = 0;
//main function
function main() {
    updatePrecision();
    setupWebGL();
    //input listener
    setInterval(() => {
        let dir = { x: 0, y: 0 };
        if (keys.w) dir.x += 1; if (keys.s) dir.x -= 1;
        if (keys.d) dir.y += 1; if (keys.a) dir.y -= 1;
        if (dir.x == 0 && dir.y == 0) { return; }
        let mag = Math.sqrt(dir.x * dir.x + dir.y * dir.y); dir.x /= mag; dir.y /= mag;
        let cos = Math.cos(camera.rotation.a); let sin = Math.sin(camera.rotation.a);
        let xR = dir.x * cos - dir.y * sin; let yR = dir.x * sin + dir.y * cos;
        camera.offset.x += 0.05 * xR; camera.offset.y += 0.05 * yR;
    }, 10);
    //start drawLoop
    requestAnimationFrame(draw);
    //fpsUpdater
    setInterval(() => {
        htmlFps.innerHTML = parseFloat(fps).toFixed(0);
    }, 500);
}
//main
main();
