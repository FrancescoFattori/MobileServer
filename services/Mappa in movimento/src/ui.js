var htmlSidebar = document.getElementById("sidebar");
var htmlSidebarToggle = document.getElementById("sidebarToggle");
var htmlExpander = document.getElementById("expander");
var htmlJson = document.getElementById("json");
var htmlMapDiv = document.getElementById("mapDiv");
var htmlMapPng = document.getElementById("mapPng");
var htmlMapSvg = document.getElementById("mapSvg");
var htmlBusDiv = document.getElementById("busDiv");

//SidebarToggle
htmlSidebar.active = true;
htmlSidebarToggle.onclick = toggleSidebar;
function toggleSidebar() {
    htmlSidebar.active = !htmlSidebar.active;
    if (htmlSidebar.active) {
        htmlSidebar.style.width = htmlSidebar.lastWidth;
        htmlSidebarToggle.style.right = "0%";
    } else {
        htmlSidebar.lastWidth = htmlSidebar.style.width;
        htmlSidebar.style.width = "0%";
        htmlSidebarToggle.style.right = "-4vmin";
    }
}
//Expander
htmlExpander.addEventListener("mousedown", resizerStart);
window.addEventListener("mousemove", (e) => { e.preventDefault(); resizerMove(e.clientX); });
window.addEventListener("mouseup", resizerEnd); window.addEventListener("touchend", resizerEnd);
function resizerStart(e) { e.preventDefault(); if (htmlSidebar.active) { htmlExpander.active = true; } }
function resizerMove(x) {
    if (htmlExpander.active) {
        let w = Math.max(Math.min(x / window.innerWidth * 100, 50), 10);
        htmlSidebar.style.width = (w) + "%";
    }
}
function resizerEnd() { htmlExpander.active = false; }
//Map navigator
var startImgX = 0, startImgY = 0, startX = 0, startY = 0;
htmlMapDiv.addEventListener("mousedown", (e) => { moveStart(e, e.clientX, e.clientY); });
window.addEventListener("mousemove", (e) => { e.preventDefault(); move(e.clientX, e.clientY); });
window.addEventListener("mouseup", moveEnd); window.addEventListener("touchend", moveEnd);
function moveStart(e, x, y) {
    e.preventDefault();
    startX = x; startY = y;
    startImgX = parseFloat(htmlMapDiv.style.left.replace("px", ""));
    startImgY = parseFloat(htmlMapDiv.style.top.replace("px", ""));
    if (isNaN(startImgX)) startImgX = 0;
    if (isNaN(startImgY)) startImgY = 0;
    htmlMapDiv.active = true;
}
htmlMapDiv.left = 0, htmlMapDiv.top = 0;
function move(x, y) {
    if (htmlMapDiv.active) {
        htmlMapDiv.left = startImgX + x - startX;
        htmlMapDiv.top = startImgY + y - startY;
        htmlMapDiv.style.left = htmlMapDiv.left + "px";
        htmlMapDiv.style.top = htmlMapDiv.top + "px";
    }
}
function moveEnd() { htmlMapDiv.active = false; }
htmlMapDiv.width = window.innerWidth;
htmlMapDiv.zoom = 1;
htmlMapDiv.style.width = htmlMapDiv.width + "px";
htmlMapPng.onload = () => {
    htmlMapDiv.height = htmlMapPng.clientHeight;
    htmlMapDiv.style.height = htmlMapDiv.height + "px";
    htmlMapDiv.aR = htmlMapDiv.height / htmlMapDiv.width;
};
htmlMapPng.onload();
window.addEventListener("wheel", (e) => {
    let dX = (e.clientX - htmlMapDiv.left) / htmlMapDiv.width;
    let dY = (e.clientY - htmlMapDiv.top) / htmlMapDiv.height * htmlMapDiv.aR;
    let temp = htmlMapDiv.width;
    htmlMapDiv.zoom = htmlMapDiv.width / window.innerWidth;
    htmlMapDiv.width = Math.max(htmlMapDiv.width - e.deltaY * 2 * htmlMapDiv.zoom, window.innerWidth);
    htmlMapDiv.zoom = htmlMapDiv.width / window.innerWidth;
    if (htmlMapDiv.zoom > 2.0) {
        htmlMapSvg.style.display = "block";
        htmlMapPng.style.display = "none";
    } else {
        htmlMapSvg.style.display = "none";
        htmlMapPng.style.display = "block";
    }
    htmlMapDiv.height = htmlMapDiv.width * htmlMapDiv.aR;
    htmlMapDiv.style.height = htmlMapDiv.height + "px";
    htmlMapDiv.style.width = htmlMapDiv.width + "px";
    htmlMapDiv.left -= (htmlMapDiv.width - temp) * dX;
    htmlMapDiv.style.left = htmlMapDiv.left + "px";
    htmlMapDiv.top -= (htmlMapDiv.width - temp) * dY;
    htmlMapDiv.style.top = htmlMapDiv.top + "px";
    for (let i = 0; i < htmlBusDiv.children.length; i++) {
        let child = htmlBusDiv.children[i];
        child.style.width = htmlMapDiv.width * 0.0026 + "px"; child.style.height = htmlMapDiv.width * 0.0026 + "px";
        child.style.border = htmlMapDiv.width * 0.00015 + "px solid white"; child.style.lineHeight = htmlMapDiv.width * 0.00235 + "px";
        child.style.fontSize = htmlMapDiv.width * 0.00175 + "px";
    }
});