//Settings
var public = false;
var port = 8080;
//Inclusions
const prvIp = require("ip");
const pubIp = require("ext-ip")();
const bodyParser = require('body-parser');
const express = require("express");
const { spawn } = require("child_process");

const app = express();
app.use(express.static("./"));
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.get("/", (req, res) => {
    res.sendFile("src/index.html", { root: __dirname });
});
app.get("/sync", (req, res) => {
    console.log("sync requested");
    res.end();
});
app.post("/command", (req, res) => {
    let p = spawn(req.body.msg, [], { shell: true });
    let msg = { text: "", type: "out" };
    p.stdout.on('data', (data) => {
        console.log("stdout: " + data);
        msg.text += Buffer.from(data).toString();
    });
    p.stderr.on('data', (data) => {
        console.error("stderr: " + data);
        msg = ({ text: Buffer.from(data).toString(), type: "err" });
    });
    p.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
        res.json(msg);
    });
});
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
    app.listen(port, ip, () => console.log(s));
}
main();
