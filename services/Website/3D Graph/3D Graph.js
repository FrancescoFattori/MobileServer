//HTML
var htmlResizer = document.getElementById("resizer"); var htmlSideDiv = document.getElementById("sideDiv"); htmlSideDiv.active = true; var htmlGraphDiv = document.getElementById("graphDiv");
var htmlStats = document.getElementById("stats"); var htmlSlidersToggle = document.getElementById("slidersToggle"); var htmlSliders = document.getElementById("sliders");
var htmlOptions = document.getElementById("options"); var htmlFormula = document.getElementById("formula"); var htmlAdvOptions = document.getElementById("advOptions");
var htmlStep = document.getElementById("step"); var htmlStepLabel = document.getElementById("stepLabel"); var htmlOptionsToggle = document.getElementById("optionsToggle");
var htmlPrecision = document.getElementById("precision"); var htmlPrecisionLabel = document.getElementById("precisionLabel"); var htmlAlgorithm = document.getElementById("algorithmSelector");
var htmlColorIteration = document.getElementById("colorIteration"); var htmlPerspective = document.getElementById("perspective"); var htmlLimitRadius = document.getElementById("limitRadius");
var htmLimitRadiusLabel = document.getElementById("limitRadiusLabel"); var htmlLighting = document.getElementById("lighting"); var htmlFpsToggle = document.getElementById("fpsToggle");
var htmlResolution = document.getElementById("resolution"); var htmlResolutionLabel = document.getElementById("resolutionLabel"); var htmlReverseLight = document.getElementById("reverseLight");
var htmlBackColor = document.getElementById("backgroundColor"); var htmlColor1 = document.getElementById("color1"); var htmlColor2 = document.getElementById("color2");
//Canvas
var canvas = document.getElementById("canvas"); var width = canvas.clientWidth; var height = canvas.clientHeight; canvas.width = width; canvas.height = height;
var gl = canvas.getContext("webgl",{antialias:true}); if (!gl) { throw new Error("WebGL not supported!"); }
window.onresize = () => {
    width = canvas.clientWidth; height = canvas.clientHeight; canvas.width = width * camera.actualRes; canvas.height = height * camera.actualRes;
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
}
var state = ""; var prevState = "";
function calcState() {
    prevState = state;
    let s = "";
    s += htmlFormula.value;
    for (let i = 0; i < sliders.length; i++) {
        let slider = sliders[i];
        s += slider.range.value;
    }
    s += JSON.stringify(options);
    s += JSON.stringify(camera);
    s += htmlBackColor.value;
    s += htmlColor1.value;
    s += htmlColor2.value;
    state = s;
}
function getColor(hex) {
    let r = parseInt(hex.substr(1, 2), 16);
    let g = parseInt(hex.substr(3, 2), 16);
    let b = parseInt(hex.substr(5, 2), 16);
    return { r: r / 255, g: g / 255, b: b / 255 };
}

var htmlX = document.getElementById("x"); var htmlY = document.getElementById("y"); var htmlZ = document.getElementById("z");
var htmlX2 = document.getElementById("x2"); var htmlY2 = document.getElementById("y2"); var htmlZ2 = document.getElementById("z2");
var htmlXLetter = document.getElementById("xLetter"); var htmlYLetter = document.getElementById("yLetter"); var htmlZLetter = document.getElementById("zLetter");
function rotateViewGraph() {
    let a = camera.rotation.a;
    let x = -Math.cos(a);
    let z = Math.sin(a);
    htmlX.style.transform = "translateY(-50%) rotate3d(0,1,0," + -a + "rad) rotate3d(" + x + ",0," + z + "," + camera.rotation.b + "rad)";
    htmlX2.style.transform = "translateY(-50%) rotate3d(0,1,0," + -a + "rad) rotate3d(" + x + ",0," + z + "," + camera.rotation.b + "rad) rotateX(90deg)";
    htmlY.style.backgroundColor = "green"; htmlY2.style.backgroundColor = "green";
    htmlY.style.transform = "translateY(-50%) rotate3d(0,1,0," + -a + "rad) rotate3d(" + x + ",0," + z + "," + camera.rotation.b + "rad) rotateY(-90deg)";
    htmlY2.style.transform = "translateY(-50%) rotate3d(0,1,0," + -a + "rad) rotate3d(" + x + ",0," + z + "," + camera.rotation.b + "rad) rotateY(-90deg) rotateX(90deg)";
    htmlZ.style.backgroundColor = "blue"; htmlZ2.style.backgroundColor = "blue";
    htmlZ.style.transform = "translateY(-50%) rotate3d(0,1,0," + -a + "rad) rotate3d(" + x + ",0," + z + "," + camera.rotation.b + "rad) rotateZ(-90deg)";
    htmlZ2.style.transform = "translateY(-50%) rotate3d(0,1,0," + -a + "rad) rotate3d(" + x + ",0," + z + "," + camera.rotation.b + "rad) rotateZ(-90deg) rotateX(90deg)";
    htmlXLetter.style.transform = "translateY(-50%) rotate3d(0,1,0," + a + "rad) rotate3d(1,0,0," + camera.rotation.b + "rad)";
    htmlYLetter.style.transform = "translateY(-50%) rotate3d(0,1,0," + (a + Math.PI * 0.5) + "rad) rotate3d(1,0,0," + camera.rotation.b + "rad)";
    htmlZLetter.style.transform = "translateY(-50%) rotateZ(90deg) rotate3d(0,1,0," + a + "rad) rotate3d(1,0,0," + camera.rotation.b + "rad)";
}

//File
var file = { name: "graph", json: "" };
function encode() {
    let s = { equation: "", options: {}, sliders: [], camera: {} };
    s.equation = htmlFormula.value;
    for (let i = 0; i < sliders.length; i++) {
        let slider = sliders[i];
        s.sliders.push({ value: slider.range.value, min: slider.min.value, max: slider.max.value });
    }
    s.options = JSON.parse(JSON.stringify(options));
    s.camera = JSON.parse(JSON.stringify(camera));
    file.json = JSON.stringify(s);
}
function decode(file) {
    let reader = new FileReader();
    reader.readAsText(file, "UTF-8");
    reader.onload = function (evt) {
        let s = JSON.parse(evt.target.result);
        htmlFormula.value = s.equation;
        options = s.options;
        camera = s.camera;
        sliders[0].range.value = s.sliders[0].value;
        sliders[0].min.value = s.sliders[0].min;
        sliders[0].max.value = s.sliders[0].max;
        updateValue(sliders[0].range);
        for (let i = 1; i < s.sliders.length; i++) {
            addSlider();
            sliders[i].range.value = s.sliders[i].value;
            sliders[i].min.value = s.sliders[i].min;
            sliders[i].max.value = s.sliders[i].max;
            updateValue(sliders[i].range);
        }
        updateOptions(true);
        updateParameters();
        updateShader();
    }
    reader.onerror = function (evt) {
        console.log("error reading file");
    }
}
function saveFile() {
    encode();
    let n = file.name + ".3dg";
    let a = window.document.createElement('a');
    a.href = window.URL.createObjectURL(new Blob([file.json], { type: 'text/plain' }));
    a.download = n;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

//Sliders
var sliders = [];
function addSlider() {
    if (sliders.length < 9) {
        let letter = avaiableLetter();
        let slider = { name: letter, dir: 1 };
        let elem = document.createElement("div"); elem.classList.add("slider");
        let name = document.createElement("input"); name.value = letter; name.onkeyup = handleKeyUp; name.maxLength = 1; name.classList.add("inputSliders"); name.classList.add("name"); elem.appendChild(name);
        let value = document.createElement("p"); value.innerText = "= 0.000"; value.classList.add("value"); elem.appendChild(value);
        let animate = document.createElement("button"); animate.innerHTML = "<i class='fa-regular fa-circle-play'></i>"; animate.classList.add("button");
        animate.style.position = "unset"; animate.style.marginLeft = "15px"; elem.appendChild(animate); slider.animate = animate;
        elem.appendChild(document.createElement("br"));
        let min = document.createElement("input"); min.onkeyup = handleKeyUp; min.inputmode = "numeric"; min.value = "0"; min.classList.add("inputSliders"); min.classList.add("min"); elem.appendChild(min);
        slider.min = min;
        let range = document.createElement("input");
        range.type = "range"; range.min = "0"; range.max = "1"; range.value = "0"; range.step = "0.0001"; range.name = letter; range.classList.add("range"); elem.appendChild(range);
        slider.range = range;
        let max = document.createElement("input"); max.onkeyup = handleKeyUp; max.inputmode = "numeric"; max.value = "1"; max.classList.add("inputSliders"); max.classList.add("max"); elem.appendChild(max);
        slider.max = max;
        htmlSliders.appendChild(elem);
        range.oninput = () => { updateValue(range); };
        animate.onclick = () => {
            if (animate.name == "1") { animate.name = "0"; animate.innerHTML = "<i class='fa-regular fa-circle-play'></i>"; }
            else { animate.name = "1"; animate.innerHTML = "<i class='fa-regular fa-circle-stop'></i>"; }
        };
        min.oninput = () => { min.value = min.value.replace(/[^0-9.-]/g, '').replace(/^(-)|-+/g, '$1').replace(/^([^.]*\.)|\.+/g, '$1'); };
        max.oninput = () => { max.value = max.value.replace(/[^0-9.-]/g, '').replace(/^(-)|-+/g, '$1').replace(/^([^.]*\.)|\.+/g, '$1'); };
        min.onchange = () => { range.min = min.value };
        max.onchange = () => { range.max = max.value };
        sliders.push(slider);
    }
}
function avaiableLetter() {
    let chars = [];
    for (let i = 0; i < sliders.length; i++) {
        chars.push(sliders[i].name);
    }
    let c = "A";
    while (chars.includes(c)) {
        c = String.fromCharCode(c.charCodeAt(0) + 1);
    }
    return c;
}
function handleKeyUp(e) {
    //key code for enter
    if (e.keyCode === 13) {
        e.preventDefault();
        e.target.blur();
    }
}
function updateValue(elem) {
    let htmlVal = elem.parentNode.children[1];
    htmlVal.innerText = "= " + parseFloat(elem.value).toFixed(3);
    let id = -1;
    for (let i = 0; i < sliders.length; i++) {
        if (elem.name == sliders[i].name) {
            id = i; break;
        }
    }
    if (id == -1) return;
    variables[id] = parseFloat(elem.value);
}
//Resizer
htmlResizer.addEventListener("mousedown", resizerStart); htmlResizer.addEventListener("touchstart", resizerStart);
window.addEventListener("mousemove", (e) => { resizerMove(e.clientX); }); window.addEventListener("touchmove", (e) => { resizerMove(e.touches[0].clientX); });
window.addEventListener("mouseup", resizerEnd); window.addEventListener("touchend", resizerEnd); window.addEventListener("touchcancel", resizerEnd);
function resizerStart() { if (htmlSideDiv.active) { htmlResizer.active = true; } }
function resizerMove(x) {
    if (htmlResizer.active) {
        let w = Math.max(Math.min(x / window.innerWidth * 100, 50), 10);
        htmlSideDiv.style.width = parseFloat(w) + "%";
        htmlGraphDiv.style.width = parseFloat(100 - w) + "%";
        window.onresize();
    }
}
function resizerEnd() { htmlResizer.active = false; }
//Toggle buttons
function toggleSideDiv() {
    if (htmlSideDiv.active) {
        htmlSideDiv.active = false;
        htmlResizer.style.display = "none";
        htmlSliders.style.display = "none";
        htmlOptions.style.display = "none";
        htmlOptionsToggle.style.display = "none";
        htmlAdvOptions.style.display = "none";
        htmlSideDiv.prevWidth = htmlSideDiv.style.width;
        htmlGraphDiv.prevGraphWidth = htmlGraphDiv.style.width;
        htmlSideDiv.style.width = "0%";
        htmlGraphDiv.style.width = "100%";
        htmlSlidersToggle.classList.add("off");
        htmlSlidersToggle.title = "Show";
    } else {
        htmlSideDiv.active = true;
        htmlResizer.style.display = "block";
        htmlSliders.style.display = "block";
        htmlOptions.style.display = "block";
        htmlOptionsToggle.style.display = "block";
        htmlSideDiv.style.width = htmlSideDiv.prevWidth;
        htmlGraphDiv.style.width = htmlGraphDiv.prevGraphWidth;
        htmlSlidersToggle.classList.remove("off");
        htmlSlidersToggle.title = "Hide";
    }
    window.onresize();
}
//Options
function toggleGrid() {
    if (options.grid == 0.0) {
        options.grid = 1.0;
    } else {
        options.grid = 0.0;
    }
    updateOptions();
}
function toggleOptions() {
    if (htmlAdvOptions.style.display == "none") {
        htmlAdvOptions.style.display = "block";
        htmlSliders.style.display = "none";
    } else {
        htmlAdvOptions.style.display = "none";
        htmlSliders.style.display = "block";
    }
}
function updateOptions(set = false) {
    if (!set) {
        options.precision = parseFloat(htmlPrecision.value);
        options.stepDist = parseFloat(htmlStep.value);
        options.resolution = parseFloat(htmlResolution.value);
        options.colorIter = htmlColorIteration.checked;
        camera.perspective = htmlPerspective.checked;
        options.limitRadius = htmlLimitRadius.value;
        camera.lighting = htmlLighting.checked;
        options.reverseLight = htmlReverseLight.checked;
    } else {
        htmlPrecision.value = options.precision.toString();
        htmlStep.value = options.stepDist.toString();
        options.resolution = parseFloat(htmlResolution.value);
        htmlColorIteration.checked = options.colorIter;
        htmlPerspective.checked = camera.perspective;
        htmlLimitRadius.value = options.limitRadius;
        htmlLighting.checked = camera.lighting;
    }
    options.maxIter = 10 / options.stepDist;
    htmlStepLabel.innerHTML = "Step: " + options.stepDist.toFixed(2) + "&nbsp&nbsp&nbsp&nbspMaxIter: " + options.maxIter.toFixed(0);
    htmlPrecisionLabel.innerHTML = "Precision: " + options.precision.toFixed(4);
    htmLimitRadiusLabel.innerHTML = "Limit Radius: " + Math.sqrt(options.limitRadius).toFixed(1);
    htmlResolutionLabel.innerHTML = "Resolution: " + options.resolution.toFixed(2) + "x";
    if (options.resolution > 1.0) { canvas.style.imageRendering = 'auto'; }
    if (options.limitRadius > 99) htmLimitRadiusLabel.innerHTML = "Limit Radius: Unbound";
    if (htmlFpsToggle.checked) { htmlStats.style.display = "block"; } else { htmlStats.style.display = "none"; }
}
//Example Equations
function selectEquation(elem) {
    htmlFormula.value = elem.value; updateShader();
    options.algorithm = parseFloat(elem.options[elem.selectedIndex].getAttribute("algorithm"));
    htmlAlgorithm.selectedIndex = (options.algorithm + 1).toFixed(0);
}
//Algorithm
function changeAlgorithm(elem) {
    let v = parseFloat(elem.value);
    options.algorithm = v;
}

//Graph Input
var rotationStart = { a: 0, b: 0 }; var clickPos = { x: 0, y: 0 }; var click = false;
function clickDown(e) {
    if (e.touches) {
        let touch = e.touches[0];
        clickPos.x = touch.pageX; clickPos.y = touch.pageY;
    } else {
        clickPos.x = e.clientX; clickPos.y = e.clientY;
    }
    rotationStart.a = camera.rotation.a; rotationStart.b = camera.rotation.b;
    click = true;
}
function clickUp(e) {
    click = false;
}
function clickMove(e) {
    if (!click) { return; }
    e.preventDefault();
    camera.actualRes = 0.25;
    if (e.touches) {
        let touch = e.touches[0];
        camera.rotation.a = rotationStart.a + (touch.pageX - clickPos.x) / width * 5;
        camera.rotation.b = rotationStart.b - (touch.pageY - clickPos.y) / height * 5;
    } else {
        camera.rotation.a = rotationStart.a + (e.clientX - clickPos.x) / width * 5;
        camera.rotation.b = rotationStart.b - (e.clientY - clickPos.y) / height * 5;
    }
    if (camera.rotation.b > Math.PI / 2) { camera.rotation.b = Math.PI / 2; }
    if (camera.rotation.b < -Math.PI / 2) { camera.rotation.b = -Math.PI / 2; }
    if (camera.rotation.a > 2 * Math.PI) { camera.rotation.a -= Math.PI * 2; }
}
canvas.addEventListener("mousedown", clickDown); canvas.addEventListener("touchstart", clickDown);
canvas.addEventListener("mouseup", clickUp); canvas.addEventListener("touchend", clickUp);
canvas.addEventListener("mousemove", clickMove); canvas.addEventListener("touchmove", clickMove);
canvas.addEventListener("wheel", (e) => {
    camera.zoom += e.deltaY * -0.0025;
    camera.zoom = Math.max(0.2, camera.zoom);
    camera.zoom = Math.min(3, camera.zoom);
});
//Math Formula
function parseTree(tree) {//parseExpression
    switch (typeof tree) {
        case "number":
            return tree.toFixed(8);
        case "string":
            return tree;
    }
    if (!Array.isArray(tree)) return;
    let s = "";
    switch (tree[0]) {
        case "+":
            s = "(" + parseTree(tree[1]) + ")";
            for (let i = 2; i < tree.length; i++) {
                s += "+(" + parseTree(tree[i]) + ")";
            }
            return s;
        case "-":
            s = "-(" + parseTree(tree[1]) + ")";
            return s;
        case "*":
            s = "(" + parseTree(tree[1]) + ")";
            for (let i = 2; i < tree.length; i++) {
                s += "*(" + parseTree(tree[i]) + ")";
            }
            return s;
        case "/":
            s = "(" + parseTree(tree[1]) + ")/(" + parseTree(tree[2]) + ")";
            return s;
        case "^":
            s = "pow(" + parseTree(tree[1]) + "," + parseTree(tree[2]) + ")";
            return s;
        case "apply":
            switch (tree[1]) {
                case "sqrt":
                    s = "sqrt(" + parseTree(tree[2]) + ")";
                    return s;
                case "sin":
                    s = "sin(" + parseTree(tree[2]) + ")";
                    return s;
                case "cos":
                    s = "cos(" + parseTree(tree[2]) + ")";
                    return s;
                case "tan":
                    s = "tan(" + parseTree(tree[2]) + ")";
                    return s;
                case "ln":
                    s = "log(" + parseTree(tree[2]) + ")";
                    return s;
                case "abs":
                    s = "abs(" + parseTree(tree[2]) + ")";
                    return s;
                default:
                    break;
            }
        default:
            break;
    }
    console.log("error");
}
function updateShader() {
    let f = MathExpression.fromLatex(htmlFormula.value);
    console.log(f);
    let p = parseTree(f.tree);
    console.log(p);
    buildRaymarchShader(p);
    state = "";
}
htmlFormula.onkeyup = handleKeyUp;

//WebGL functions
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
    uni.backColor = gl.getUniformLocation(program, "backColor");
    uni.color1 = gl.getUniformLocation(program, "color1");
    uni.color2 = gl.getUniformLocation(program, "color2");
}
function updateParameters() {
    let position = calcCameraPosition();
    let uni = Raymarch.uniformLoc;
    gl.uniform2f(uni.resolution, gl.canvas.width, gl.canvas.height);
    gl.uniform3f(uni.cameraPos, position.x, position.y, position.z);
    gl.uniform3f(uni.cameraOff, camera.offset.x, camera.offset.y, camera.offset.z);
    gl.uniform2f(uni.cameraRot, camera.rotation.a - Math.PI / 2, camera.rotation.b);
    gl.uniform1fv(uni.variables, variables);
    let bC = getColor(htmlBackColor.value);
    gl.uniform3f(uni.backColor, bC.r, bC.g, bC.b);
    let c1 = getColor(htmlColor1.value);
    gl.uniform3f(uni.color1, c1.r, c1.g, c1.b);
    let c2 = getColor(htmlColor2.value);
    gl.uniform3f(uni.color2, c2.r, c2.g, c2.b);
    //update options
    options.array[0] = options.stepDist;
    options.array[1] = options.maxIter;
    options.array[2] = options.precision;
    options.array[3] = options.algorithm;
    options.array[4] = options.grid;
    options.array[5] = options.colorIter;
    options.array[6] = camera.perspective;
    options.array[7] = camera.zoom;
    options.array[8] = camera.lighting;
    options.array[9] = options.limitRadius;
    options.array[10] = options.reverseLight;
    gl.uniform1fv(uni.options, options.array);
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

function updateSliders() {
    if (!sliders.length) return;
    for (let i = 0; i < sliders.length; i++) {
        if (sliders[i].animate.name == "1") {
            let r = parseFloat(sliders[i].range.max) - parseFloat(sliders[i].range.min);
            let val = parseFloat(sliders[i].range.value) + sliders[i].dir * 0.25 / fps * r;
            sliders[i].range.value = val;
            if (val > parseFloat(sliders[i].range.max) ||
                val < parseFloat(sliders[i].range.min)) {
                sliders[i].dir *= -1;
            }
            updateValue(sliders[i].range);
        }
    }
}
function draw() {
    fps = 1000 / (performance.now() - time); time = performance.now();
    updateSliders();
    calcState();
    if (state != prevState) {
        rotateViewGraph();
        if (camera.actualRes < options.resolution - 0.1) { camera.actualRes += 0.25; window.onresize(); }
        if (camera.actualRes > options.resolution + 0.1) { camera.actualRes = options.resolution; window.onresize(); }
        //Draw Raymarch
        bindBuffer(Raymarch.buffer, Raymarch.program, Raymarch.vertices);
        gl.useProgram(Raymarch.program);
        updateParameters();
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
    window.requestAnimationFrame(draw);
}
//Camera and camera.precision settings
var camera = {
    position: { x: 0, y: 0, z: 0 },
    offset: { x: 0, y: 0, z: 0 },
    rotation: { r: 10, a: -0.4, b: -0.5 },
    zoom: 1,
    perspective: 0,
    lighting: 1,
    actualRes: 0.25,
};
var Raymarch = { program: null, buffer: null, vertShader: null, fragShader: null, uniformLoc: {}, vertices: [] };
var variables = [0, 0, 0, 0, 0, 0, 0, 0, 0];//Sliders
var options = {
    stepDist: 0.1,
    maxIter: 100,
    precision: 0.1,
    grid: 0.0,
    algorithm: 2.0,
    limitRadius: 25.0,
    resolution: 1,
    array: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
};
var canvasVertices = [
    -1, -1, 0,
    -1, 1, 0,
    1, 1, 0,
    -1, -1, 0,
    1, -1, 0,
    1, 1, 0,
];
var time; var fps = 0;
//main function
function main() {
    time = performance.now();
    updateOptions();
    addSlider();
    setupWebGL();
    //start drawLoop
    requestAnimationFrame(draw);
    //fpsUpdater
    setInterval(() => {
        htmlStats.innerHTML = "fps:" + fps.toFixed(0);// + "   camera position:{" + camera.offset.x.toFixed(2) + "," + camera.offset.y.toFixed(2) + "," + camera.offset.z.toFixed(2) + "}";
    }, 100);
}
//main
main();