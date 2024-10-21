//Settings
var public = false;
var port = 8081;
//Inclusions
const prvIp = require('ip');
const pubIp = require('ext-ip')();
const express = require("express");

var process = require('process');
process.chdir(__dirname);

const app = express();
app.use(express.static("./"));
app.get("/", (req, res) => {
    res.redirect("/Homepage");
});
app.get("/view", (req, res) => {
    res.redirect("/Homepage");
});
app.get("/Homepage", (req, res) => {
    res.sendFile("./Homepage.html", { root: __dirname });
});
app.get("/3D_Cube", (req, res) => {
    res.sendFile("./3D_Cube/3D_Cube.html", { root: __dirname });
});
app.get("/NeuralNetwork", (req, res) => {
    res.sendFile("./Neural_Network/Neural_Network.html", { root: __dirname });
});
app.get("/MandelbrotSet", (req, res) => {
    res.sendFile("./Mandelbrot_Set/Mandelbrot.html", { root: __dirname });
});
app.get("/3D_Graph", (req, res) => {
    res.sendFile("./3D Graph/Raymarch Graph.html", { root: __dirname });
});
app.get("/Mandelbulb", (req, res) => {
    res.sendFile("./Mandelbulb/Mandelbulb.html", { root: __dirname });
});
app.get("/Poesie", (req, res) => {
    res.sendFile("./Poesie/Poesie.html", { root: __dirname });
});
app.get("/Isotta", (req, res) => {
    res.redirect("/Poesie");
});
app.get("/Ines", (req, res) => {
    res.redirect("/Poesie");
});
app.use((req, res) => {
    res.status(404).sendFile("./404.html", { root: __dirname });
});

async function main() {
    await new Promise(r => setTimeout(r, 1000));
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