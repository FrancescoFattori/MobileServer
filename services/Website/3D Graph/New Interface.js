function setupWebGL() {
    Raymarch.vertices = canvasVertices;
    Raymarch.buffer = gl.createBuffer();
    Raymarch.vertShader = loadShader(vertexShaderSource, gl.VERTEX_SHADER);
    buildRaymarchShader("pow(x,4.0)+pow(y,4.0)+pow(z,4.0)-1.0");
}
function buildRaymarchShader(formula) {
    let fragmentShaderSource = fragmentShaderSourceStart + formula + fragmentShaderSourceEnd;
    Raymarch.fragShader = loadShader(fragmentShaderSource, gl.FRAGMENT_SHADER);
    Raymarch.program = createProgram(Raymarch.vertShader, Raymarch.fragShader);
    setUpParameters(Raymarch.program);
}
function calcCameraPosition() {
    let xO = camera.offset.x; let yO = camera.offset.y; let zO = camera.offset.z;
    let r = camera.rotation.r; let a = -camera.rotation.a + Math.PI / 2; let b = camera.rotation.b + Math.PI / 2;
    let x = xO - r * Math.sin(b) * Math.cos(a);
    let y = yO + r * Math.sin(b) * Math.sin(a);
    let z = zO + r * Math.cos(b);
    camera.position = { x: x, y: y, z: z };
    return { x: x, y: y, z: z };
}
function loadShader(src, type) {
    let shader = gl.createShader(type);
    gl.shaderSource(shader, src);
    gl.compileShader(shader);
    var compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    console.log('Shader compiled successfully: ' + compiled);
    var compilationLog = gl.getShaderInfoLog(shader);
    console.log('Shader compiler log: ' + compilationLog);
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
    let uni = Raymarch.uniformLoc;
    uni.resolution = gl.getUniformLocation(program, "u_resolution");
    uni.cameraPos = gl.getUniformLocation(program, "c_position");
    uni.cameraOff = gl.getUniformLocation(program, "c_offset");
    uni.cameraRot = gl.getUniformLocation(program, "c_rotation");
    uni.variables = gl.getUniformLocation(program, "variables");
    uni.options = gl.getUniformLocation(program, "options");
}
function bindBuffer(buffer, program, data) {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.DYNAMIC_DRAW);
    let positionLocation = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);
}
function updateParameters() {
    let position = calcCameraPosition();
    let uni = Raymarch.uniformLoc;
    gl.uniform2f(uni.resolution, gl.canvas.width, gl.canvas.height);
    gl.uniform3f(uni.cameraPos, position.x, position.y, position.z);
    gl.uniform3f(uni.cameraOff, camera.offset.x, camera.offset.y, camera.offset.z);
    gl.uniform2f(uni.cameraRot, camera.rotation.a - Math.PI / 2, camera.rotation.b);
    gl.uniform1fv(uni.variables, variables);
    //update options
    options.array[0] = options.stepDist;
    options.array[1] = options.maxIter;
    options.array[2] = options.precision;
    options.array[3] = options.algorithm;
    options.array[4] = 1;//options.grid;
    options.array[5] = options.colorIter;
    options.array[6] = camera.perspective;
    options.array[7] = camera.zoom;
    options.array[8] = camera.lighting;
    options.array[9] = options.limitRadius;
    gl.uniform1fv(uni.options, options.array);
}

function draw() {
    //updateSliders();
    //Draw Raymarch
    fps = 0;
    let state = JSON.stringify(options) + JSON.stringify(camera);
    if (state != prevState) {
        rT = performance.now() - time;
        fps = 1000.0 / rT;
        time = performance.now();
        bindBuffer(Raymarch.buffer, Raymarch.program, Raymarch.vertices);
        gl.useProgram(Raymarch.program);
        updateParameters();
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        rotateViewGraph();
    }
    prevState = JSON.stringify(options) + JSON.stringify(camera);
    window.requestAnimationFrame(draw);
}


function main() {
    window.onresize();
    time = performance.now();
    //updateOptions();
    //toggleGrid();
    //addSlider();
    setupWebGL();
    //start drawLoop
    requestAnimationFrame(draw);
    //fpsUpdater
    setInterval(() => {
        htmlFps.innerHTML = "fps:" + fps.toFixed(0) + " rT:" + rT.toFixed(2)+"ms";
    }, 100);
}
main();