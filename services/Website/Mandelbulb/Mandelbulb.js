//WebGL
var canvas = document.getElementById("canvas"); var width = canvas.clientWidth; var height = canvas.clientHeight; canvas.width = width; canvas.height = height;
window.onresize = () => { width = canvas.clientWidth; height = canvas.clientHeight; canvas.width = width; canvas.height = height; }
var gl;
//HTML
var htmlFps = document.getElementById("fps");
var htmlPrecision = document.getElementById("precision"); var htmlPrecisionLabel = document.getElementById("precisionLabel");
var htmlMaxIter = document.getElementById("maxIter"); var htmlMaxIterLabel = document.getElementById("maxIterLabel");
var htmlPower = document.getElementById("power"); var htmlPowerLabel = document.getElementById("powerLabel");
function updatePrecision() {
    d = htmlPrecision.value; maxIter = htmlMaxIter.value; power = htmlPower.value;
    htmlPowerLabel.innerHTML = 'power = ' + parseFloat(power).toFixed(1);
    htmlPrecisionLabel.innerHTML = 'precision = ' + parseFloat(d).toFixed(5);
    htmlMaxIterLabel.innerHTML = 'maxIter = ' + parseFloat(maxIter).toFixed(0);
}
//Shader Parameters
var l_resolution; var l_parameters; var l_cameraPosition; var l_cameraRotation; var l_range; var l_cameraZoom; var l_palette;
//Vertex Shader
var vertexShaderSource = `
    attribute vec3 position;
    void main() {
        gl_Position = vec4(position,1);
    }
`;
//FragmentShader
var fragmentShaderSource = `
    precision highp float;
    uniform vec2 u_resolution;
    uniform vec4 parameters;
    uniform vec3 palette[255];
    uniform vec3 c_position;
    uniform vec2 c_rotation;
    uniform float zoom;
    #define PI 3.1415926538
    int steps=0;
    float SDF(vec3 point){
        vec3 z = point;
	    float dr = 1.0;
	    float r = 0.0;
        float Power = parameters.z;
	    for (int i = 0; i < 100; i++) {
            if(i >= int(parameters.y)) break;
		    r = length(z);
            steps = i;
		    if (r>2.0) break;
		
		    // convert to polar coordinates
		    float theta = acos(z.z/r);
		    float phi = atan(z.y,z.x);
		    dr =  pow(r, Power-1.0)*Power*dr+1.0;
		
		    // scale and rotate the point
		    float zr = pow(r,Power);
		    theta = theta*Power;
		    phi = phi*Power;
		
		    // convert back to cartesian coordinates
		    z = zr*vec3(sin(theta)*cos(phi), sin(phi)*sin(theta), cos(theta));
		    z+=point;
	    }
	    return 0.5*log(r)*r/dr;
    }

    vec3 calcRayDir(vec2 pos, vec2 res){
        //calc starting vector
        float x = (res.x + res.y) / 5.0 * (zoom*zoom + 1.0);
        float y = pos.x - (res.x / 2.0);
        float z = pos.y - (res.y / 2.0);

        //rotation along y axis
        float Cos = cos(c_rotation.y); float Sin = sin(c_rotation.y);
        float xR = x*Cos - z*Sin; float zR = x*Sin + z*Cos;

        //rotation along z axis
        Cos = cos(c_rotation.x); Sin = sin(c_rotation.x);
        float xR2 = xR*Cos - y*Sin; float yR = xR*Sin + y*Cos;

        return normalize(vec3(xR2,yR,zR));
    }

    vec3 calcPoint(vec3 dir){
        vec3 point = c_position;
        float d = parameters.x;
        for(int i = 0; i < 10000; i++){
            if(i >= int(parameters.y)*2) break;
            float value = SDF(point);
            if(abs(value) < d){ return point;}
            //movePoint
            point = point + dir * value;
        }
        return vec3(0.0, 0.0, 0.0);
    }

    vec3 calcNormal(vec3 point){
        float d = 0.00001; float x = point.x; float y = point.y; float z = point.z;
        float dX = SDF(point-vec3(+d,  0,  0)) - SDF(point-vec3(-d,  0,  0));
        float dY = SDF(point-vec3( 0, +d,  0)) - SDF(point-vec3( 0, -d,  0));
        float dZ = SDF(point-vec3( 0,  0, +d)) - SDF(point-vec3( 0,  0, -d));
        return normalize(vec3(dX, dY, dZ));
    }

    void main() {
        //Calculate Ray Direction based on x,y pixel coord
        vec3 dir = calcRayDir(gl_FragCoord.xy, u_resolution);
        //Calculate closest point to shape in Direction
        vec3 point = calcPoint(dir);
        //If Point undefined color is black
        if(point == vec3(0.0, 0.0, 0.0)){gl_FragColor = vec4(0,0,0,1); return;}
        if(parameters.w==0.0){
            vec3 normal = calcNormal(point);
            float col = abs(normal.z * -1.0);
            gl_FragColor = vec4(col+0.1, col+0.1, col+0.1, 1.0);
        }else if(parameters.w==1.0){
            float depth = 2.0-length(point);
            float col = parameters.w * 5.0 / (3.0 * depth) * 10.0 * pow(1.0 / float(steps), 3.0);
            gl_FragColor = vec4(col, col, col, 1.0);
        }
        else if(parameters.w==2.0){
            float depth = 2.0-length(point);
            //Ivan Algorithm
            int r = 2 * int(depth*depth*depth*100.0);
            int g = 7 * int(depth*depth*depth*100.0);
            int b = 11 * int(depth*depth*depth*100.0);
            int counterR = 0;
            int counterG = 0;
            int counterB = 0;
            for (int i = 0;i < 1000000; i++) {
                 if(r>255){
                r -= 255;
                counterR++;
                }else{break;}
            }
            if (mod(float(counterR), 2.0) == 1.0) {
              r = 256 - r;
             }
         for (int i = 0;i < 1000000; i++) {
             if(g>255){
                   g -= 255;
                  counterG++;
              }else{break;}
        }
        if (mod(float(counterG), 2.0) == 1.0) {
            g = 254 - g;
        }
        for (int i = 0;i<1000000; i++) {
            if(b>255){
                b -= 255;
                counterB++;
            }else{break;}
        }
        if (mod(float(counterB), 2.0) == 1.0) {
            b = 255 - b;
        }
        if (steps == int(parameters.y)) {
            r = 0;
            g = 0;
            b = 0;
        }
        gl_FragColor = vec4(float(r)/255.0, float(g)/255.0, float(b)/255.0, 1.0);
        }
        else if(parameters.w==3.0){
            float depth = 2.0-length(point);
            int idx = int(depth*depth*depth*175.0);
            for (int i=0;i<10000;i++){
                if(idx>255){idx-=255;}else{break;}
            }
            vec3 color;
            for (int i=0; i<255; i++) {
                if (i==idx) {
                    color = palette[i];
                   break;
                }
             }
            gl_FragColor = vec4(float(color.x)/255.0, float(color.y)/255.0, float(color.z)/255.0, 1.0);
        }
        else if(parameters.w==4.0){
            vec3 normal = calcNormal(point);
            float depth = 2.0-length(point);
            float shadow = abs(normal.z * -1.0)/10.0 - (pow((depth + 1.0),7.0)/400.0)/5.0;
            int idx = int(depth*depth*depth*125.0 + (atan(point.y,point.x)+PI)*40.60 + (point.z+1.0)*150.0);
            for (int i=0;i<1000000;i++){
                if(idx>=255){idx-=255;}else{break;}
            }
            vec3 color;
            for (int i=0; i<255; i++) {
                if (i==idx) {
                    color = palette[i];
                   break;
                }
             }
            gl_FragColor = vec4(float(color.x)/300.0+shadow+0.1, float(color.y)/300.0+shadow+0.1, float(color.z)/300.0+shadow+0.1, 1.0);
        }
    }
`;
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
    let positionLocation = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);
    l_resolution = gl.getUniformLocation(program, "u_resolution");
    l_parameters = gl.getUniformLocation(program, "parameters");
    l_palette = gl.getUniformLocation(program, "palette");
    l_cameraPosition = gl.getUniformLocation(program, "c_position");
    l_cameraRotation = gl.getUniformLocation(program, "c_rotation");
    l_range = gl.getUniformLocation(program, "range");
    l_cameraZoom = gl.getUniformLocation(program, "zoom");
}
function setUpBuffer(vertices) {
    let buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
}
//Input handling
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
    let zoom = camera.zoom * camera.zoom;
    if (e.touches) {
        let touch = e.touches[0];
        camera.rotation.a = rotationStart.a + (touch.pageX - clickPos.x) / width * 5 / (zoom + 1);
        camera.rotation.b = rotationStart.b - (touch.pageY - clickPos.y) / height * 5 / (zoom + 1);
    } else {
        camera.rotation.a = rotationStart.a + (e.clientX - clickPos.x) / width * 5 / (zoom + 1);
        camera.rotation.b = rotationStart.b - (e.clientY - clickPos.y) / height * 5 / (zoom + 1);
    }
    if (camera.rotation.b > Math.PI / 2) { camera.rotation.b = Math.PI / 2; }
    if (camera.rotation.b < -Math.PI / 2) { camera.rotation.b = -Math.PI / 2; }
    if (camera.rotation.a > 2 * Math.PI) { camera.rotation.a -= Math.PI * 2; }
}
canvas.addEventListener("mousedown", clickDown); canvas.addEventListener("touchstart", clickDown);
canvas.addEventListener("mouseup", clickUp); canvas.addEventListener("touchend", clickUp);
canvas.addEventListener("mousemove", clickMove); canvas.addEventListener("touchmove", clickMove);
var keys = { w: 0, a: 0, s: 0, d: 0 };
document.addEventListener('keydown', (e) => {
    switch (e.key) {
        case "w":
            keys.w = true;
            break;
        case "a":
            keys.a = true;
            break;
        case "s":
            keys.s = true;
            break;
        case "d":
            keys.d = true;
            break;
        case "r":
            camera.offset.x = 0;
            camera.offset.y = 0;
            camera.offset.z = 0;
            camera.zoom = 0.75;
            break;
    }
});
document.addEventListener('keyup', (e) => {
    switch (e.key) {
        case "w":
            keys.w = false;
            break;
        case "a":
            keys.a = false;
            break;
        case "s":
            keys.s = false;
            break;
        case "d":
            keys.d = false;
            break;
    }
});
canvas.addEventListener("wheel", (e) => {
    camera.zoom += e.deltaY * -0.0025;
    camera.zoom = Math.max(0, camera.zoom);
    camera.zoom = Math.min(30, camera.zoom);
});
//Logic functions
function setupWebGL() {
    let vertexData = [
        -1, -1, 0,
        -1, 1, 0,
        1, 1, 0,
        -1, -1, 0,
        1, -1, 0,
        1, 1, 0,
    ];
    setUpBuffer(vertexData);
    let vertexShader = loadShader(vertexShaderSource, gl.VERTEX_SHADER);
    let fragmentShader = loadShader(fragmentShaderSource, gl.FRAGMENT_SHADER);
    let program = createProgram(vertexShader, fragmentShader);
    setUpParameters(program);
    gl.useProgram(program);
}
function calcCameraPosition() {
    let xO = camera.offset.x; let yO = camera.offset.y; let zO = camera.offset.z;
    let r = camera.rotation.r; let a = -camera.rotation.a; let b = camera.rotation.b + Math.PI / 2;
    let x = xO - r * Math.sin(b) * Math.cos(a);
    let y = yO + r * Math.sin(b) * Math.sin(a);
    let z = zO + r * Math.cos(b);
    return { x: x, y: y, z: z };
}
function draw() {
    fps = 1000 / (performance.now() - time); time = performance.now();
    let position = calcCameraPosition();
    gl.uniform2f(l_resolution, canvas.width, canvas.height);
    gl.uniform4f(l_parameters, d, maxIter, power, mode);
    gl.uniform3fv(l_palette, palette);
    gl.uniform3f(l_cameraPosition, position.x, position.y, position.z);
    gl.uniform2f(l_cameraRotation, camera.rotation.a, camera.rotation.b);
    gl.uniform1f(l_cameraZoom, camera.zoom);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    window.requestAnimationFrame(draw);
}
//Camera and Precision settings
var camera = {
    offset: { x: 0, y: 0, z: 0 },
    rotation: { r: 2.1, a: 0, b: -Math.PI / 4 },
    zoom: 0.75
};
var d = 0.1; var maxIter = 10; var power = 8; var mode = 0;
//Variables
var time = performance.now(); var fps = 0;
var p = new Array(255).fill({
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
    p[i] = {
        r: r,
        g: g,
        b: b
    };
}
var palette = [];
p.forEach(element => {
    palette.push(element.r); palette.push(element.g); palette.push(element.b);
});
//main function
function main() {
    if (window.innerWidth < window.innerHeight) {
        canvas.style.width = "100vw";
        canvas.style.height = "100vw";
        canvas.style.bottom = "unset";
        canvas.style.left = "0";
        document.getElementById("space").style.height = "95vw";
        width = canvas.clientWidth; height = canvas.clientHeight; canvas.width = width; canvas.height = height;
        htmlPrecision.style.width = "70%";
        htmlMaxIter.style.width = "70%";
        htmlPower.style.width = "70%";
    }
    gl = canvas.getContext("webgl"); if (!gl) { throw new Error("WebGL not supported!"); }
    updatePrecision();
    setupWebGL();
    //input listener
    /*setInterval(() => {
        let dir = { x: 0, y: 0 };
        if (keys.w) dir.x += 1; if (keys.s) dir.x -= 1;
        if (keys.d) dir.y += 1; if (keys.a) dir.y -= 1;
        if (dir.x == 0 && dir.y == 0) { return; }
        let mag = Math.sqrt(dir.x * dir.x + dir.y * dir.y); dir.x /= mag; dir.y /= mag;
        let cos = Math.cos(camera.rotation.a); let sin = Math.sin(camera.rotation.a);
        let xR = dir.x * cos - dir.y * sin; let yR = dir.x * sin + dir.y * cos;
        camera.offset.x += 0.05 * xR; camera.offset.y += 0.05 * yR;
    }, 10);*/
    //start drawLoop
    requestAnimationFrame(draw);
    //fpsUpdater
    setInterval(() => {
        htmlFps.innerHTML = parseFloat(fps).toFixed(0);
    }, 500);
}
//main
main();