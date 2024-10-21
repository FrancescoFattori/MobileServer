var htmlMenu = document.getElementById("menu");
var htmlTerminal = document.getElementById("terminal");
var htmlServicesPage = document.getElementById("servicesPage");
var htmlTerminalDiv = document.getElementById("terminalDiv");
var htmlInput = document.getElementById("input");
var htmlServicesDiv = document.getElementById("servicesDiv");
var htmlProcessesDiv = document.getElementById("processesDiv");


htmlMenu.onclick = () => {
    htmlServicesPage.style.display = "grid";
    htmlTerminalDiv.style.display = "none";
    htmlMenu.style.backgroundColor = "gray";
    htmlTerminal.style.backgroundColor = "rgb(90,90,90)";
}

htmlTerminal.onclick = () => {
    htmlServicesPage.style.display = "none";
    htmlTerminalDiv.style.display = "block";
    htmlMenu.style.backgroundColor = "rgb(90,90,90)";
    htmlTerminal.style.backgroundColor = "gray";
    htmlInput.focus();
}

htmlTerminalDiv.onclick = () => {
    htmlInput.focus();
}

function post(msg, type, callback) {
    let xhr = new XMLHttpRequest();
    xhr.open("POST", "/" + type);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.send(JSON.stringify({ msg: msg }));
    xhr.onload = () => {
        if (xhr.readyState == 4 && xhr.status == 200) {
            let data = JSON.parse(xhr.response);
            callback(data);
        } else {
            console.log(`Error: ${xhr.status}`);
        }
    };
}

function pushMessage(data) {
    let msg = data.text; let type = data.type;
    let elem = document.createElement("p");
    elem.innerText = msg;
    if (type == "err") elem.style.color = "red";
    let command = document.createElement("p");
    command.innerText = "-"; command.style.left = "0.5vmin"; command.style.top = "unset";
    if (type == "err") command.style.color = "red";
    let lastChild = htmlTerminalDiv.children[htmlTerminalDiv.children.length - 1];
    htmlTerminalDiv.insertBefore(command, lastChild);
    lastChild = htmlTerminalDiv.children[htmlTerminalDiv.children.length - 1];
    htmlTerminalDiv.insertBefore(elem, lastChild);
}

htmlInput.addEventListener('keyup', function (e) {
    if (e.key === 'Enter' || e.keyCode === 13) {
        if (htmlInput.value == "clear") {
            let lastChild = htmlTerminalDiv.children[htmlTerminalDiv.children.length - 1];
            while (htmlTerminalDiv.firstChild != lastChild) {
                htmlTerminalDiv.removeChild(htmlTerminalDiv.firstChild);
                lastChild = htmlTerminalDiv.children[htmlTerminalDiv.children.length - 1];
            }
            htmlInput.value = "";
            return;
        }
        post(htmlInput.value, "command", pushMessage);
        htmlInput.value = "";
    }
});

function get(type, callback) {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", "/" + type);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.send();
    xhr.onload = () => {
        if (xhr.readyState == 4 && xhr.status == 200) {
            let data = JSON.parse(xhr.response);
            callback(data);
        } else {
            console.log(`Error: ${xhr.status}`);
        }
    };
}

function replaceButFirst(div) {
    let length = div.children.length - 1;
    for (let i = 0; i < length; i++) {
        let lastChild = div.children[div.children.length - 1];
        div.removeChild(lastChild);
    }
}

function drawProcesses(data) {
    replaceButFirst(htmlProcessesDiv);
    for (let i = 0; i < data.length; i++) {
        let process = data[i];
        let elem = document.createElement("div");
        elem.classList.add("process");
        let button = document.createElement("button");
        button.classList.add("processButton");
        button.innerHTML = "kill";
        button.onclick = () => {
            post(process.pid, "kill", (data) => { update(); });
        };
        elem.innerHTML = process.name + " - " + process.pid;
        elem.appendChild(button);
        htmlProcessesDiv.appendChild(elem);
    }
}

function drawServices(data) {
    replaceButFirst(htmlServicesDiv);
    for (let i = 0; i < data.length; i++) {
        let service = data[i];
        let elem = document.createElement("div");
        elem.classList.add("process");
        let elem1 = document.createElement("div");
        elem1.classList.add("processBox");
        if (service.pid != undefined) {
            let stop = document.createElement("button");
            stop.classList.add("processButton");
            stop.style.backgroundColor = "green";
            stop.innerHTML = "stop";
            stop.onclick = () => {
                post(service.pid, "kill", (data) => { update(); });
            };
            elem1.appendChild(stop);
        } else {
            let start = document.createElement("button");
            start.classList.add("processButton");
            start.style.backgroundColor = "rgb(225,0,0)";
            start.innerHTML = "start";
            start.onclick = () => {
                post(service.name, "service", () => { update(); });
            };
            elem1.appendChild(start);
        }
        elem.innerHTML = service.name;
        elem.appendChild(elem1);
        htmlServicesDiv.appendChild(elem);
    }
}

function update() {
    get("processes", drawProcesses);
    get("services", drawServices);
    setTimeout(() => {
        get("processes", drawProcesses);
        get("services", drawServices);
    }, 1000);
    setTimeout(() => {
        get("processes", drawProcesses);
        get("services", drawServices);
    }, 3000);
}

update();