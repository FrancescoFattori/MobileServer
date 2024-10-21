//Resizer
htmlExpander.addEventListener("mousedown", resizerStart); htmlExpander.addEventListener("touchstart", resizerStart);
window.addEventListener("mousemove", (e) => { resizerMove(e.clientX); }); window.addEventListener("touchmove", (e) => { resizerMove(e.touches[0].clientX); });
window.addEventListener("mouseup", resizerEnd); window.addEventListener("touchend", resizerEnd); window.addEventListener("touchcancel", resizerEnd);
function resizerStart() { if (htmlSideBar.active) { htmlExpander.active = true; } }
function resizerMove(x) {
    if (htmlExpander.active) {
        let w = Math.max(Math.min(x / window.innerWidth * 100, 50), 15);
        htmlSideBar.style.width = parseFloat(w) + "%";
        htmlRender.style.width = parseFloat(100 - w) + "%";
        window.onresize();
    }
}
function resizerEnd() { htmlExpander.active = false; }

//Equation
function handleKeyUp(e) {
    if (e.keyCode === 13) {
        e.preventDefault();
        e.target.blur();
    }
} htmlFormula.onkeyup = handleKeyUp;
function createEquation() {
    let eq = addEquation();
    selectEquation(eq.children[2]);
}
var dragged;
function addEquation(opt = {}) {
    let el = document.createElement("div"); el.classList.add("equation"); el.draggable = true; el.ondragstart = dragStart; el.ondragover = (e) => { e.preventDefault() }; el.ondragenter = (e) => { e.preventDefault() }; el.ondrop = drop;
    let side = document.createElement("div"); side.classList.add("equationSide"); side.onmouseenter = () => { side.over = true }; side.onmouseleave = () => { side.over = false }; el.appendChild(side);
    let aB = document.createElement("div"); aB.classList.add("activeBtn"); aB.onclick = () => { toggleActiveBtn(aB) }; toggleActiveBtn(aB);
    if (opt.color) aB.style.backgroundColor = opt.color; el.appendChild(aB);
    let f = document.createElement("math-field"); f.classList.add("formula");
    let fBox = document.createElement("div"); fBox.classList.add("formula"); fBox.onclick = () => { selectEquation(fBox) };
    fBox.style.zIndex = 1; fBox.style.height = "100%"; fBox.style.width = "100%";
    if (opt.text) f.innerHTML = opt.text; el.appendChild(f); el.appendChild(fBox);
    let del = document.createElement("div"); del.classList.add("deleteEq"); del.innerHTML = "<i class='fa-solid fa-trash-can'></i>"; del.onclick = () => { deleteEquation(del) }; el.appendChild(del);
    let tS = document.createElement("div"); tS.classList.add("toggleSlider"); tS.style.display = "none"; el.appendChild(tS);
    let sS = document.createElement("div"); sS.classList.add("sliderSpeed"); sS.style.display = "none"; el.appendChild(sS);
    let sM = document.createElement("div"); sM.classList.add("sliderMode"); sM.style.display = "none"; el.appendChild(sM);
    let rMin = document.createElement("input"); rMin.classList.add("rangeLimit"); rMin.style.display = "none"; rMin.onkeyup = handleKeyUp; rMin.value = "-1"; el.appendChild(rMin);
    let rS = document.createElement("input"); rS.type = "range"; rS.classList.add("rangeSlider"); rS.style.display = "none"; el.appendChild(rS);
    let rMax = document.createElement("input"); rMax.classList.add("rangeLimit"); rMax.style.display = "none"; rMax.value = "1"; rMax.onkeyup = handleKeyUp; el.appendChild(rMax);
    htmlEquations.appendChild(el);
    let eq = { elem: el, text: opt.text, color: opt.color, slider: opt.slider };
    checkEquationSlider(eq);
    equations.push(eq);
    return el;
}
function dragStart() {
    dragged = this;
    if (!dragged.children[0].over) return false
}
function drop(e) {
    e.preventDefault();
    let target = e.target;
    while (target.parentNode) { if (target.parentNode.stop) { break; } target = target.parentNode; }
    let tID = 0; while ((target = target.previousSibling) != null) tID++;
    let dID = 0; while ((dragged = dragged.previousSibling) != null) dID++;
    target = htmlEquations.children[tID]; dragged = htmlEquations.children[dID];
    if (dID > tID) {
        htmlEquations.insertBefore(dragged, target);
    } else {
        htmlEquations.insertBefore(dragged, target.nextSibling);
    }
    let copy = equations[dID];
    equations.splice(dID, 1);
    equations.splice(tID, 0, copy);
    console.log(equations);
}
function toggleActiveBtn(elem) {
    if (elem.checked) {
        elem.checked = false;
        elem.backgroundColor = elem.style.backgroundColor;
        elem.style.backgroundColor = "black";
    } else {
        elem.style.backgroundColor = elem.backgroundColor;
        elem.checked = true;
    }
}
function selectEquation(fBox) {
    let formula = fBox.parentNode.children[2];
    let eq = formula.parentNode;
    for (let i = 0; i < equations.length; i++) {
        let equation = equations[i];
        if (equation.elem.selected) {
            equation.elem.selected = false;
            equation.elem.style.border = "none";
        }
    }
    eq.selected = true;
    eq.style.border = "0.2vmin solid black";
    htmlFormula.value = formula.innerHTML;
    htmlFormula.innerHTML = formula.innerHTML;
    htmlFormula.focus();
    htmlFormula.executeCommand("moveToMathfieldEnd");
}
function changeSelectedEquation() {
    for (let i = 0; i < equations.length; i++) {
        let equation = equations[i];
        if (equation.elem.selected) {
            equation.elem.children[2].value = htmlFormula.value;
            equation.elem.children[2].innerHTML = htmlFormula.value;
            equation.text = htmlFormula.value;
        }
    }
}
function deleteEquation(del) {
    let elem = del.parentNode;
    if (elem.selected) { htmlFormula.value = ""; htmlFormula.innerHTML = ""; htmlFormula.blur(); }
    elem.remove();
    for (let i = 0; i < equations.length; i++) {
        let equation = equations[i];
        if (!document.contains(equation.elem)) { equations.splice(i, 1); break; }
    }
}
function checkEquationSlider(eq) {
    let aB = eq.elem.children[1];
    let f = eq.elem.children[2];
    let tS = eq.elem.children[5];
    let sS = eq.elem.children[6];
    let sM = eq.elem.children[7];
    let rMin = eq.elem.children[8];
    let rS = eq.elem.children[9];
    let rMax = eq.elem.children[10];
    if (eq.slider) {
        aB.style.display = "none";
        f.style.top = "35%";
        rS.style.display = "block";
        rMin.style.display = "block"; rMax.style.display = "block"; rMax.style.right = "0.25vmin"; rMax.style.left = "unset";
        tS.innerHTML = "<i class='fa-regular fa-circle-play'></i>"; tS.style.display = "block";
        sS.innerHTML = "1x"; sS.style.display = "block";
        sM.innerHTML = "<i class='fa-solid fa-repeat'></i>"; sM.style.display = "block";
    } else {

    }
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
    camera.zoom = Math.max(0, camera.zoom);
    camera.zoom = Math.min(3, camera.zoom);
});
//Main
let col = { r: Math.random() * 255, g: Math.random() * 255, b: Math.random() * 255 };
let txt = "x = " + (Math.random() * 10).toFixed(3);
addEquation({ text: txt, color: "rgb(" + col.r + "," + col.g + "," + col.b + ")" });
addEquation({ text: "a=10.000", slider: true });

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

function toggleOptions() {
    if (htmlOptionsBar.style.display == "block") {
        htmlOptionsBar.style.display = "none";
    } else {
        htmlOptionsBar.style.display = "block";
    }
}

function openFullscreen() {
    let elem = document.documentElement;
    if (elem.requestFullscreen) {
        elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) { /* Safari */
        elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) { /* IE11 */
        elem.msRequestFullscreen();
    }
    screen.orientation.lock("landscape");
}
function closeFullscreen() {
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.webkitExitFullscreen) { /* Safari */
        document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) { /* IE11 */
        document.msExitFullscreen();
    }
}
var fullscreen = false;
var htmlFullscreen = document.getElementById("fullscreen");
function toggleFullscreen() {
    if (!fullscreen) {
        fullscreen = true;
        htmlFullscreen.innerHTML = "<i class='fa-solid fa-compress'></i>";
        openFullscreen();
    } else {
        fullscreen = false;
        htmlFullscreen.innerHTML = "<i class='fa-solid fa-expand'></i>";
        closeFullscreen();
    }
}
