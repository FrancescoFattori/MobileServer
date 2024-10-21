//HTML
var htmlBody = document.getElementById("body");
var htmlMainEquation = document.getElementById("mainEquation");
var htmlFormula = document.getElementById("formula");
var htmlEquation = document.getElementById("equation");
var htmlEquations = document.getElementById("equations"); htmlEquations.stop = true;
var htmlExpander = document.getElementById("expander");
var htmlSideBar = document.getElementById("sideBar");
var htmlRender = document.getElementById("render");
var htmlX = document.getElementById("x"); var htmlY = document.getElementById("y"); var htmlZ = document.getElementById("z");
var htmlX2 = document.getElementById("x2"); var htmlY2 = document.getElementById("y2"); var htmlZ2 = document.getElementById("z2");
var htmlXLetter = document.getElementById("xLetter"); var htmlYLetter = document.getElementById("yLetter"); var htmlZLetter = document.getElementById("zLetter");
var htmlOptionsBar = document.getElementById("optionsBar");
var htmlFps = document.getElementById("fps");
htmlSideBar.active = true;
//Canvas
var canvas = document.getElementById("canvas"); var width = canvas.clientWidth; var height = canvas.clientHeight; canvas.width = width; canvas.height = height;
var gl = canvas.getContext("webgl"); if (!gl) { throw new Error("WebGL not supported!"); }
window.onresize = () => {
    options.resolution=0.75;
    width = canvas.clientWidth; height = canvas.clientHeight;
    canvas.width = width * options.resolution; canvas.height = height * options.resolution;
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
}
//Logic
var equations = [];
var camera = {
    position: { x: 0, y: 0, z: 0 },
    offset: { x: 0, y: 0, z: 0 },
    rotation: { r: 5, a: -0.4, b: -0.5 },
    zoom: 1,
    perspective: 0,
    lighting: 1,
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
var prevState = {};
var canvasVertices = [
    -1, -1, 0,
    -1, 1, 0,
    1, 1, 0,
    -1, -1, 0,
    1, -1, 0,
    1, 1, 0,
];
var time; var fps = 0; var rT = 0;