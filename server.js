//Settings
var public = false;
var port = 8000;
var services = [
    { name: "Website", command: 'node "services/Website/server.js" port: 8001 public', startup: true },
    { name: "Mappa in movimento", command: 'node "services/Mappa in movimento/server.js" port: 8002 public', startup: true },
]
//Inclusions
const prvIp = require("ip");
const pubIp = require("ext-ip")();
const bodyParser = require('body-parser');
const express = require("express");
const { spawn } = require("child_process");
var kill = require('tree-kill');

var Processes = [];

function cleanProcesses() {
    for (let i = 0; i < Processes.length; i++) {
        if (Processes[i].closed) {
            Processes.splice(i, 1); i--;
        }
    }
}

const app = express();
app.use(express.static("./"));
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.get("/", (req, res) => {
    res.sendFile("src/index.html", { root: __dirname });
});
app.get("/processes", (req, res) => {
    res.json(Processes);
});
app.get("/services", (req, res) => {
    res.json(services);
});
app.post("/command", (req, res) => {
    console.log(">> " + req.body.msg);
    let p = spawn(req.body.msg, [], { shell: true });
    p.name = req.body.msg;
    Processes.push(p);
    let msg = { text: "", type: "out" };
    p.stdout.on('data', (data) => {
        console.log(p.pid + " stdout: " + data);
        msg.text += Buffer.from(data).toString();
    });
    p.stderr.on('data', (data) => {
        console.error(p.pid + " stderr: " + data);
        msg = ({ text: Buffer.from(data).toString(), type: "err" });
    });
    p.on('close', (code) => {
        p.closed = true; cleanProcesses();
        console.log("child process: " + p.pid + " exited with code: " + code);
        res.json(msg);
    });
    p.on('exit', (code) => {
        p.closed = true; cleanProcesses();
        console.log("child process: " + p.pid + " killed with code: " + code);
    });
});
app.post("/service", (req, res) => {
    console.log(">> service " + req.body.msg);
    let service = undefined;
    for (let i = 0; i < services.length; i++) {
        if (req.body.msg == services[i].name) {
            service = services[i]; break;
        }
    }
    if (!service) return;
    startService(service);
});
app.post("/kill", (req, res) => {
    let pid = req.body.msg;
    for (let i = 0; i < Processes.length; i++) {
        let p = Processes[i];
        if (p.pid == pid) {
            p.closed = true;
            if (p.service) p.service.pid = undefined;
            cleanProcesses();
            kill(p.pid);
        }
    }
    res.json({});
});

function startService(service) {
    console.log("Starting service: " + service.name + " >> " + service.command);
    let p = spawn(service.command, [], { shell: true });
    p.service = service;
    p.name = service.name;
    service.pid = p.pid;
    Processes.push(p);
    p.stdout.on('data', (data) => {
        console.log(p.pid + " stdout: " + data);
    });
    p.stderr.on('data', (data) => {
        console.error(p.pid + " stderr: " + data);
    });
    p.on('close', (code) => {
        p.closed = true; cleanProcesses();
        console.log("child process: " + p.pid + " exited with code: " + code);
    });
    p.on('exit', (code) => {
        p.closed = true; cleanProcesses();
        console.log("child process: " + p.pid + " killed with code: " + code);
    });
}

async function main() {
    //Reading parameters
    for (let i = 0; i < process.argv.length; i++) {
        let arg = process.argv[i];
        if (arg == "public") {
            public = true;
        }
        if (arg == "port:") {
            port = parseInt(process.argv[i + 1]);
            if (isNaN(port)) { port = 8080; console.log("invalid port"); }
            i++;
        }
    }
    //Printing connection infos
    await pubIp.get().then(ip => { console.log("Public IP: " + ip); }).catch(err => { console.error(err); });
    console.log("Private IP: " + prvIp.address());
    let ip = "localhost"; if (public) ip = "0.0.0.0";
    let s = "Hosting " + (public ? "public" : "local") + " Server on port: " + port;
    app.listen(port, ip, () => {
        console.log(s);
        for (let i = 0; i < services.length; i++) {
            let service = services[i]; if (!service.startup) continue;
            startService(service);
        }
    });
}
main();
