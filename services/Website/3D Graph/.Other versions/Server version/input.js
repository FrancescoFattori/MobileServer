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
var keys = { w: 0, a: 0, s: 0, d: 0 };
/*document.addEventListener('keydown', (e) => {
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
});*/
canvas.addEventListener("wheel", (e) => {
    camera.zoom += e.deltaY * -0.0025;
    camera.zoom = Math.max(0, camera.zoom);
    camera.zoom = Math.min(5, camera.zoom);
});
//MathInput handling
var mf = document.getElementById('formula'); var variables = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
var sliders = document.getElementsByClassName("sliderVar");
var labels = document.getElementsByClassName("labelVar");
function changeSliders() {
    for (let i = 0; i < labels.length; i++) {
        labels[i].innerHTML = String.fromCharCode('A'.charCodeAt(0) + i) + " = " + variables[i].toFixed(3);
        variables[i] = parseFloat(sliders[i].value);
    }
} changeSliders();

function parseTree(tree) {//parseExpression
    switch (typeof tree) {
        case "number":
            return tree.toFixed(5);
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
                default:
                    break;
            }
        default:
            break;
    }
    console.log("error");
}

mf.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
        let f = MathExpression.fromLatex(mf.value);
        console.log(f);
        let p = parseTree(f.tree);
        console.log(p);
        buildRaymarchShader(p);
        mf.blur();
    }
});
