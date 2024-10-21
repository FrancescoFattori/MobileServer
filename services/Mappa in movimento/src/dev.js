var htmlDevPoints = document.getElementById("devPoints");

var htmlDevStop = document.getElementById("devStop");
var htmlDevBus = document.getElementById("devBus");
var htmlDevSelectAll = document.getElementById("devSelectAll");
var htmlDevMode = document.getElementById("devMode");
var htmlDevModify1 = document.getElementById("devModify1");
//-------------------------------------------------------
var htmlDevStop1 = document.getElementById("devStop1");
var htmlDevStop2 = document.getElementById("devStop2");
var htmlDevStop3 = document.getElementById("devStop3");
var htmlDevBus1 = document.getElementById("devBus1");
var htmlDevSelectAll1 = document.getElementById("devSelectAll1");
var htmlDevNextStop1 = document.getElementById("devNextStop1");
var htmlDevNextStop2 = document.getElementById("devNextStop2");
var htmlDevNextStop3 = document.getElementById("devNextStop3");
var htmlDevNumber = document.getElementById("devNumber");
var htmlDevPop = document.getElementById("devPop");
var htmlDevModify2 = document.getElementById("devModify2");

var mode = "";

function initDevConsole() {
    let arr = [htmlDevStop, htmlDevStop1, htmlDevStop2, htmlDevStop3, htmlDevNextStop1, htmlDevNextStop2, htmlDevNextStop3];

    for (let j = 0; j < arr.length; j++) {
        if (j == 2 || j == 3 || j == 5 || j == 6) {
            let elem1 = document.createElement("option");
            elem1.value = undefined;
            arr[j].appendChild(elem1);
        }
    }

    for (let i = 0; i < stopsData.length; i++) {
        let stop = stopsData[i];
        for (let j = 0; j < arr.length; j++) {
            let elem = document.createElement("option");
            elem.value = stop.stopId;
            elem.innerHTML = stop.stopName + " " + stop.stopId;
            arr[j].appendChild(elem);
        }
    }

    function findStopData(stopId) {
        for (let i = 0; i < stopsData.length; i++) {
            let stop = stopsData[i];
            if (stop.stopId == stopId) {
                return stop;
            }
        }
        return undefined;
    }
    function genSelectableBus(stopArrDiv, busDiv) {
        busDiv.replaceChildren();
        let listBus = [];
        for (let i = 0; i < stopArrDiv.length; i++) {
            let stopDiv = stopArrDiv[i];
            let stop = findStopData(stopDiv.value);
            if (!stop) continue;
            for (let j = 0; j < stop.routes.length; j++) {
                if (listBus.indexOf(stop.routes[j].routeId) > -1) continue;
                let elem = document.createElement("input");
                elem.type = "checkbox";
                elem.value = stop.routes[j].routeId;
                listBus.push(stop.routes[j].routeId);
                busDiv.append("\u00A0 " + stop.routes[j].routeShortName);
                busDiv.appendChild(elem);
                busDiv.appendChild(document.createElement("br"));
            }
        }
        fetchMapStops();
    }

    for (let j = 0; j < arr.length; j++) {
        if (j > 3) { arr[j].onchange = fetchMapStops(); }
        else {
            let busDiv = htmlDevBus;
            if (j == 0) {
                arr[j].onchange = () => { genSelectableBus([arr[j]], busDiv) };
                arr[j].onchange();
            } else {
                arr[j].onchange = () => { genSelectableBus([arr[1], arr[2], arr[3]], htmlDevBus1) };
                arr[j].onchange();
            }
        }
    }

    htmlDevSelectAll.onclick = () => {
        for (const child of htmlDevBus.children) {
            if (child.nodeName == "INPUT")
                child.checked = true;
        }
        fetchMapStops();
    }

    htmlDevSelectAll1.onclick = () => {
        for (const child of htmlDevBus1.children) {
            if (child.nodeName == "INPUT")
                child.checked = true;
        }
        fetchMapStops();
    }

    function toggleButton(button) {
        button.state = !button.state;
    }

    function updateButton(button) {
        if (button.state) {
            button.innerHTML = "Stop";
            button.style.backgroundColor = "red";
        } else {
            button.innerHTML = "Modify";
            button.style.backgroundColor = "white";
        }
    }
    function updateMode() {
        if (htmlDevModify1.state) mode = "pos";
        else if (htmlDevModify2.state) mode = "coords";
        else mode = "";
    }

    htmlDevModify1.state = false;
    htmlDevModify1.onclick = () => {
        toggleButton(htmlDevModify1);
        updateButton(htmlDevModify1);
        if (htmlDevModify2.state) {
            toggleButton(htmlDevModify2);
            updateButton(htmlDevModify2);
        }
        updateMode();
    }

    htmlDevModify2.state = false;
    htmlDevModify2.onclick = () => {
        toggleButton(htmlDevModify2);
        updateButton(htmlDevModify2);
        if (htmlDevModify1.state) {
            toggleButton(htmlDevModify1);
            updateButton(htmlDevModify1);
        }
        updateMode();
    }
}

function fetchMapStops() {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', '/mapStops', true);
    xhr.responseType = 'json';
    xhr.send();
    xhr.onload = function () {
        let responseObj = xhr.response;
        mapStops = responseObj;
        drawPoints();
    };
}

function findStop(stopId) {
    for (let i = 0; i < mapStops.length; i++) {
        let stop = mapStops[i];
        if (stop.stopId == stopId) {
            return stop;
        }
    }
}

function createPoint(color) {
    let elem = document.createElement("div");
    elem.style.width = 0.26 + "%"; elem.style.height = 0.26 / htmlMapDiv.aR + "%";
    elem.style.border = 4 + "px solid " + color;
    elem.style.borderRadius = "50%";
    elem.style.transform = "translate(-50%,-50%)";
    let elem1 = document.createElement("div");
    elem1.style.width = "4px"; elem1.style.height = "4px";
    elem1.style.transform = "translate(-50%,-50%)";
    elem1.style.left = "50%"; elem1.style.top = "50%";
    elem1.style.backgroundColor = color;
    elem.appendChild(elem1);
    return elem;
}

htmlDevPoints.style.width = "100%"; htmlDevPoints.style.height = "100%"; htmlDevPoints.style.zIndex = "2";
function drawPoints() {
    htmlDevPoints.replaceChildren();
    let stop = findStop(parseInt(htmlDevStop.value));
    for (let i = 0; i < stop.routes.length; i++) {
        let route = stop.routes[i];
        for (let j = 0; j < htmlDevBus.children.length; j += 2) {
            if (route.routeId == htmlDevBus.children[j].value && htmlDevBus.children[j].checked) {
                let greenPoint = createPoint("green");
                greenPoint.style.left = route.pos.x + "%"; greenPoint.style.top = route.pos.y + "%";
                htmlDevPoints.appendChild(greenPoint);
                for (let k = 0; k < route.nextStops.length; k++) {
                    nextStop = route.nextStops[k];
                    if (nextStop.stopId == parseInt(htmlDevNextStop.value)) {
                        for (let l = 0; l < nextStop.coords.length; l++) {
                            let coord = nextStop.coords[l];
                            let redPoint = createPoint("red");
                            let name = document.createElement("p");
                            name.style.margin = "0";
                            name.style.fontSize = "30px";
                            name.style.position = "absolute";
                            name.style.left = "0%"; name.style.top = "0%";
                            name.style.textShadow = "1px 1px 2px #FFFFFF, -1px 1px 2px #FFFFFF, 1px -1px 2px #FFFFFF,-1px -1px 2px #FFFFFF";
                            name.innerHTML = l + 1;
                            redPoint.appendChild(name);
                            redPoint.style.left = coord.x + "%"; redPoint.style.top = coord.y + "%";
                            htmlDevPoints.appendChild(redPoint);
                        }
                        break;
                    }
                }
                break;
            }
        }
    }
}
htmlBusDiv.addEventListener("mousedown", handleRightClick);

function handleRightClick(e) {
    e.preventDefault();
    if (e.button == 2 && htmlDevModify.state) {
        let xhr = new XMLHttpRequest();
        xhr.open('POST', '/mapStops');
        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        let routesId = [];
        for (const child of htmlDevBus.children) {
            if (child.checked) {
                routesId.push(parseInt(child.value));
            }
        }
        if (mode == "pos") {
            xhr.send(JSON.stringify({
                stopId: parseInt(htmlDevStop.value),
                routesId: routesId,
                mode: htmlDevMode.value,
                pos: {
                    x: (e.clientX - htmlMapDiv.left) / htmlMapDiv.width * 100.0,
                    y: (e.clientY - htmlMapDiv.top) / htmlMapDiv.height * 100.0
                }
            }));
        } else if (mode == "coords") {
            let stop = findStop(parseInt(htmlDevStop.value));
            let coords = [];
            for (let i = 0; i < stop.routes.length; i++) {
                let route = stop.routes[i];
                for (let j = 0; j < htmlDevBus.children.length; j += 2) {
                    if (route.routeId == htmlDevBus.children[j].value && htmlDevBus.children[j].checked) {
                        for (let k = 0; k < route.nextStops.length; k++) {
                            nextStop = route.nextStops[k];
                            if (nextStop.stopId == parseInt(htmlDevNextStop.value)) {
                                console.log(nextStop);
                                if (nextStop.coords.length < parseInt(htmlDevNumber.value)) nextStop.coords.push({});
                                nextStop.coords[parseInt(htmlDevNumber.value) - 1] = {
                                    x: (e.clientX - htmlMapDiv.left) / htmlMapDiv.width * 100.0,
                                    y: (e.clientY - htmlMapDiv.top) / htmlMapDiv.height * 100.0
                                };
                                coords = nextStop.coords;
                                htmlDevNumber.value++;
                                break;
                            }
                        }
                    }
                }
            }
            xhr.send(JSON.stringify({
                stopId: parseInt(htmlDevStop.value),
                routesId: routesId,
                nextStopId: parseInt(htmlDevNextStop.value),
                mode: htmlDevMode.value,
                coords: coords
            }));
        }
        xhr.onload = function () {
            fetchMapStops();
        };
    }
}

htmlDevPop.onclick = () => {
    let stop = findStop(parseInt(htmlDevStop.value));
    for (let i = 0; i < stop.routes.length; i++) {
        let route = stop.routes[i];
        for (let j = 0; j < htmlDevBus.children.length; j += 2) {
            if (route.routeId == htmlDevBus.children[j].value && htmlDevBus.children[j].checked) {
                for (let k = 0; k < route.nextStops.length; k++) {
                    nextStop = route.nextStops[k];
                    nextStop.coords.pop();
                    xhr.send(JSON.stringify({
                        stopId: parseInt(htmlDevStop.value),
                        routesId: [route.routeId],
                        nextStopId: parseInt(htmlDevNextStop.value),
                        mode: "coords",
                        coords: nextStop.coords
                    }));
                }
            }
        }
    }
    drawPoints();
}

var mapStops = [
    //Esempio
    {//Piazza Dante Stazione FS
        id: 247,
        routes: [
            {//5
                id: 400,
                pos: { x: 0, y: 0 },//posizione del bus sulla fermata
                nextStops: [
                    {//via Rosmini
                        id: 0,
                        coords: [//coordinate dei punti tra le due fermate (escluse)
                            { x: 0, y: 0 }
                        ]
                    }
                ]
            }
        ]
    }
];