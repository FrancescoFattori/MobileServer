var htmlServices = document.getElementById("services");
var htmlTerminal = document.getElementById("terminal");
var htmlServicesDiv = document.getElementById("servicesDiv");
var htmlTerminalDiv = document.getElementById("terminalDiv");
var htmlInput = document.getElementById("input");


htmlServices.onclick = () => {
    htmlServicesDiv.style.display = "block";
    htmlTerminalDiv.style.display = "none";
    htmlServices.style.backgroundColor = "gray";
    htmlTerminal.style.backgroundColor = "rgb(90,90,90)";
}

htmlTerminal.onclick = () => {
    htmlServicesDiv.style.display = "none";
    htmlTerminalDiv.style.display = "block";
    htmlServices.style.backgroundColor = "rgb(90,90,90)";
    htmlTerminal.style.backgroundColor = "gray";
}

function post(msg, type) {
    let xhr = new XMLHttpRequest();
    xhr.open("POST", "/" + type);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    console.log(msg);
    xhr.send(JSON.stringify({ msg: msg }));
    xhr.onload = () => {
        if (xhr.readyState == 4 && xhr.status == 200) {
            let data = JSON.parse(xhr.response);
            console.log(xhr.response);
            pushMessage(data.text, data.type);
        } else {
            console.log(`Error: ${xhr.status}`);
        }
    };
}

function pushMessage(msg, type) {
    let elem = document.createElement("p");
    elem.innerText = msg;
    if (type == "err") elem.style.color = "red";
    let lastChild = htmlTerminalDiv.children[htmlTerminalDiv.children.length - 1];
    htmlTerminalDiv.insertBefore(elem, lastChild);
}

htmlInput.addEventListener('keyup', function (e) {
    if (e.key === 'Enter' || e.keyCode === 13) {
        post(htmlInput.value, "command");
        htmlInput.value = "";
    }
});