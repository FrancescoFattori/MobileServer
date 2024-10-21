var stopsData = [];
var routesData = [];

function initDevConsole() { }//declaration

function refresh() {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', '/refresh');
    xhr.responseType = 'json';
    xhr.send();
    xhr.onload = function () {
        let responseObj = xhr.response;
        trips = responseObj;
        console.log(trips);
        drawBus();
    };
}
function fetchData() {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', '/data');
    xhr.responseType = 'json';
    xhr.send();
    xhr.onload = function () {
        let responseObj = xhr.response;
        stopsData = responseObj.stops;
        routesData = responseObj.routes;
        initDevConsole();
    };
}

function drawBus() {
    htmlBusDiv.replaceChildren();
    for (let i = 0; i < trips.length; i++) {
        if (trips[i].pos.x == 0 && trips[i].pos.y == 0) continue;
        let elem = document.createElement("div");
        let nextLine = "\n";
        let d = new Date(trips[i].lastEvent);
        elem.title =
            "Linea: " + trips[i].name + nextLine +
            "Prossima Fermata: " + trips[i].stopNextName + nextLine +
            "Progresso: " + trips[i].progression + "/" + trips[i].stopTotal + nextLine +
            "Matricola: " + trips[i].matricola + nextLine +
            "Ultimo Aggiornamento: " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
        elem.style.width = htmlMapDiv.width * 0.0026 + "px"; elem.style.height = htmlMapDiv.width * 0.0026 + "px";
        elem.style.border = htmlMapDiv.width * 0.00015 + "px solid white";
        elem.style.borderRadius = "50%";
        elem.style.transform = "translate(-50%,-50%)";
        elem.style.left = trips[i].pos.x + "%";
        elem.style.top = trips[i].pos.y + "%";
        elem.style.backgroundColor = "#" + trips[i].color;
        if (!trips[i].color) elem.style.backgroundColor = "black";
        elem.style.color = "white";
        elem.style.textAlign = "center";
        elem.style.verticalAlign = "middle";
        elem.style.lineHeight = htmlMapDiv.width * 0.00235 + "px";
        elem.style.fontSize = htmlMapDiv.width * 0.00175 + "px";
        elem.style.cursor = "default";
        elem.innerHTML = trips[i].name;
        htmlBusDiv.appendChild(elem);
    }
}

//main
refresh();
setInterval(refresh, 15000);
fetchData();