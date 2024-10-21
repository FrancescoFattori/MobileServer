//Settings
var public = false;
var port = 8080;

const express = require('express');
const request = require('request');
const bodyParser = require('body-parser');
const fs = require('fs');

var process = require('process');
process.chdir(__dirname);

var mapStops = [];
var stops = [];
var routes = [];
var trips = [];

const app = express();
{//web requests
    app.use(express.static('./'));
    app.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        next();
    });
    app.get('/', (req, res) => {
        res.sendFile("src/index.html", { root: __dirname });
    });
    app.get('/emptypage', (req, res) => {
        res.json({});
    });
    app.get('/refresh', (req, res) => {
        res.json(trips);
    });
    app.get('/data', (req, res) => {
        res.json({ stops: stops, routes: routes });
    });
    app.get('/mapStops', (req, res) => {
        res.json(mapStops);
    });
    app.use(bodyParser.json()); // for parsing application/json
    app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
    function searchStop(arr, stopId) {
        for (let i = 0; i < arr.length; i++) {
            if (arr[i].stopId == stopId) {
                return arr[i];
            }
        }
        return undefined;
    }
    function addStop(arr, stopId = 0) {
        arr.push({
            stopId: stopId
        });
        return arr[arr.length - 1];
    }
    function searchRoute(mapStop, routeId) {
        for (let i = 0; i < mapStop.routes.length; i++) {
            let route = mapStop.routes[i];
            if (route.routeId == routeId) {
                return route;
            }
        }
        return undefined;
    }
    function addRoute(mapStop, routeId) {
        mapStop.routes.push({
            routeId: routeId,
            pos: { x: 0, y: 0 },
            nextStops: []
        });
        return mapStops[mapStops.length - 1];
    }
    app.post('/mapStops', (req, res) => {
        let data = req.body;
        console.log(data);
        let mapStop = searchStop(mapStops, data.stopId);
        if (!mapStop) { mapStop = addStop(mapStops, data.stopId); mapStop.routes = []; }
        for (let i = 0; i < data.routesId.length; i++) {
            let route = searchRoute(mapStop, data.routesId[i]);
            if (!route) route = addRoute(mapStop, data.routesId[i]);
            if (data.mode == "pos") {
                route.pos = data.pos;
            } else if (data.mode == "coords") {
                let nextStop = searchStop(route.nextStops, data.nextStopId);
                if (!nextStop) nextStop = addStop(route.nextStops, data.nextStopId);
                nextStop.coords = data.coords;
            }
        }
        res.json({});
    });
}

function requestStops() {
    request(//Stops
        {
            url: 'https://app-tpl.tndigit.it/gtlservice/stops?' + new URLSearchParams({ type: 'U' }).toString(),
            headers: {
                'Authorization': 'Basic bWl0dG1vYmlsZTplY0dzcC5SSEIz',
            },
        },
        (error, response, body) => {
            if (error || response.statusCode !== 200) {
                console.log(error.message);
                return;
            }
            stops = JSON.parse(body); if (!stops) return;
            for (let i = 0; i < stops.length; i++) {
                if (stops[i].town != "Trento" && stops[i].town != "Lavis") {
                    stops.splice(i, 1); i--;
                }
            }
            fs.writeFile('src/stops.json', JSON.stringify(stops, null, "\t"), function (err) {
                if (err) throw err;
            });
            let stopsShort = []
            for (let i = 0; i < stops.length; i++) {
                stopsShort.push({
                    stopId: stops[i].stopId,
                    stopName: stops[i].stopName,
                    street: stops[i].street
                })
            }
            fs.writeFile('src/stopsShort.json', JSON.stringify(stopsShort, null, "\t"), function (err) {
                if (err) throw err;
            });
            console.log("stops fetched: " + stops.length);
        }
    );
}

function requestRoutes() {
    request(//Stops
        {
            url: 'https://app-tpl.tndigit.it/gtlservice/routes?' + new URLSearchParams({ areas: 23 }).toString(),
            headers: {
                'Authorization': 'Basic bWl0dG1vYmlsZTplY0dzcC5SSEIz',
            },
        },
        (error, response, body) => {
            if (error || response.statusCode !== 200) {
                console.log(error.message);
                return;
            }
            routes = JSON.parse(body); if (!routes) return;
            fs.writeFile('src/routes.json', JSON.stringify(routes, null, "\t"), function (err) {
                if (err) throw err;
            });
            console.log("routes fetched: " + routes.length);
        }
    );
}

function readMapStops() {
    fs.readFile('src/mapData.json', function (err, data) {
        if (err) throw err;
        mapStops = JSON.parse(data);
    });
}

function saveMapStops() {
    fs.writeFile('src/mapData.json', JSON.stringify(mapStops, null, "\t"), function (err) {
        if (err) throw err;
        console.log('mapData saved!');
    });
}

function requestTrips(idx) {
    if (routes.length - 1 < idx) return;
    request(
        {
            url: 'https://app-tpl.tndigit.it/gtlservice/trips_new?' + new URLSearchParams({ routeId: routes[idx].routeId, type: 'U', limit: 8 }).toString(),
            headers: {
                'Authorization': 'Basic bWl0dG1vYmlsZTplY0dzcC5SSEIz',
            },
        },
        (error, response, body) => {
            if (error || response.statusCode !== 200) {
                console.log(error.message);
                return;
            }
            let data = JSON.parse(body); if (!data) return;
            for (let i = 0; i < data.length; i++) {
                let tripData = data[i];
                let matricola = tripData.matricolaBus; if (!matricola) continue;
                if (tripData.lastEventRecivedAt) {
                    let diffSec = (new Date() - new Date(tripData.lastEventRecivedAt)) / 1000;
                    if (diffSec > 300) continue;
                    if (diffSec > 120 && tripData.lastSequenceDetection == tripData.stopTimes.length) continue;
                } else continue;
                let trip = undefined;
                for (let j = 0; j < trips.length; j++) {
                    if (trips[j].matricola == matricola) {
                        if (trips[j].tripId == tripData.tripId) {
                            trip = trips[j];
                            break;
                        } else if (trips[j].progression > tripData.lastSequenceDetection) {
                            trips.splice(j, 1);
                        }
                    }
                }
                if (!trip) {
                    trips.push({ tripId: tripData.tripId, matricola: matricola });
                    trip = trips[trips.length - 1];
                }
                trip.stopLast = tripData.stopLast;
                trip.stopNext = tripData.stopNext;
                trip.progression = tripData.lastSequenceDetection;
                trip.stopTotal = tripData.stopTimes.length;
                trip.lastEvent = tripData.lastEventRecivedAt;
                trip.timeToNext = 0;
                if (trip.progression != trip.stopTotal && trip.progression > 0) {
                    trip.timeToNext = (
                        new Date("0000-01-01 " + tripData.stopTimes[trip.progression].arrivalTime) -
                        new Date("0000-01-01 " + tripData.stopTimes[trip.progression - 1].arrivalTime)) / 60000;
                    if (trip.timeToNext < 0) trip.timeToNext += 1440;
                }
                let name = "";
                let color = "";
                for (let j = 0; j < routes.length; j++) {
                    if (routes[j].routeId == tripData.routeId) {
                        name = routes[j].routeShortName;
                        color = routes[j].routeColor;
                        break;
                    }
                }
                if (name == "5/") color = "F5C500";
                let stopLastName = "";
                let stopNextName = "";
                for (let j = 0; j < stops.length; j++) {
                    if (stops[j].stopId == tripData.stopLast) {
                        stopLastName = stops[j].stopName;
                    }
                    if (stops[j].stopId == tripData.stopNext) {
                        stopNextName = stops[j].stopName;
                    }
                }
                let x = 0, y = 0;//move to client
                for (let j = 0; j < mapStops.length; j++) {
                    if (mapStops[j].stopId == tripData.stopLast) {
                        if (mapStops[j].routes.length > 0) {
                            x = mapStops[j].routes[0].pos.x;
                            y = mapStops[j].routes[0].pos.y;
                            for (let k = 0; k < mapStops[j].routes.length; k++) {
                                if (mapStops[j].routes[k].routeId == tripData.routeId) {
                                    x = mapStops[j].routes[k].pos.x;
                                    y = mapStops[j].routes[k].pos.y;
                                }
                            }
                        }
                        break;
                    }
                }
                trip.name = name;
                trip.color = color;
                trip.routeId = tripData.routeId;
                trip.stopLastName = stopLastName;
                trip.stopNextName = stopNextName;
                trip.pos = { x: x, y: y };
            }
            for (let i = 0; i < trips.length; i++) {
                let diffSec = (new Date() - new Date(trips[i].lastEvent)) / 1000;
                if (diffSec > 600) {
                    trips.splice(i, 1); break;
                }
                if (diffSec > 120 && trips[i].progression == trips[i].stopTotal) {
                    trips.splice(i, 1); break;
                }
                if ((diffSec / 60 > trips[i].timeToNext * 2) && (trips[i].progression == trips[i].stopTotal - 1)) {
                    trips.splice(i, 1); break;
                }
            }
        }
    );
}

function setup() {
    readMapStops();
    requestStops();
    requestRoutes();
}

function update() {
    let i = 0;
    setInterval(() => { requestTrips(i); i++; i %= routes.length; }, 1000 + (Math.random() * 200 - 100));
    setInterval(() => { saveMapStops(); }, 30000);
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
    setup();
    app.listen(port, ip, () => {
        update();
    });
}
main();

/*
process.on('uncaughtException', UncaughtExceptionHandler);

function UncaughtExceptionHandler(err)
{
    console.log("Uncaught Exception Encountered!!");
    console.log("err: ", err);
    console.log("Stack trace: ", err.stack);
    setInterval(function(){}, 1000);
}
*/