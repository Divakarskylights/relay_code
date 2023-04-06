const fs = require('fs');
const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const gpiopw = require('rpi-gpio').promise;
const localStorage = require("localStorage");
const influx = require('influx');
const localInfluxClient = new influx.InfluxDB('http://localhost:8086/staroffice');
const app = express();
var cors = require('cors');
const request = require('request');
const date = require('date-and-time');
var adr = 'http://worldtimeapi.org/api/timezone/Asia/Kolkata';
const nodemailer = require('nodemailer');
require('dotenv').config();
const path = require("path");
const hbs = require("nodemailer-express-handlebars");
var Gpio = require('onoff').Gpio;
const { text } = require('body-parser');
// MariaDB Lib
const mariadb = require('mariadb');
var macaddress = require('macaddress');
const os = require('os');
const disk = require('diskusage');
// const cp = require('child_process');
const localtunnel = require('localtunnel');
const { spawn } = require('child_process');
const https = require('https');
// var localTunnelUrl = 'lt --port 3000 --subdomain myapp --print-requests --header "Bypass-Tunnel-Reminder: true"';
app.use(cors());
app.use(bodyParser.json());
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'DELETE, PUT, GET, POST');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

const apiOptions = {
    url: 'http://localhost:3000/api/annotations',
    headers: {
        'Authorization': 'Bearer eyJrIjoiQ0Y5eVp1ODdvRmloMXptVTNnRmFyT3ZmYjNsT1RiZG0iLCJuIjoicmVsYXlhcGkiLCJpZCI6MX0=',
        'content-type': 'application/json',
        'Accept': 'application/json',
    },
    rejectUnauthorized: false,
};


const Gpio = require('onoff').Gpio;

const RELAY_PINS = [5, 6, 13, 16, 19, 20, 21, 26];

async function startup() {
    RELAY_PINS.forEach(async (pin, index) => {
        const relay = new Gpio(pin, 'null');
        const status = relay.readSync() === 0 ? 'false' : 'true';
        console.log(`Relay ${index + 1}: ${status}`);
        localStorage.setItem(`R${index + 1}`, status);
    });
}

startup();


// Mail declarations

async function msg_Inst(textmail, Relname) {
    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: 'skylightstesting@gmail.com',
            pass: 'xifapatnoercyles'
        }
    });

    let messageOptions = {
        from: 'skylightstesting@gmail.com',
        to: 'skylightstesting@gmail.com',
        subject: `Alert ${Relname}`,
        text: textmail,
    };
    try {
        const info = await transporter.sendMail(messageOptions);
        console.log(`Email successfully sent to ${info.messageId}`);
    } catch (error) {
        console.error(`Error occurred while sending email to ${error}`);
    }

}

async function time(sendTime, Relname, Rid, RUser) {
    try {
        const response = await fetch(adr);
        const body = await response.json();
        const currentTime = body.datetime.slice(0, 19).replace('T', ' Time: ');

        let textmail;
        const isOn = localStorage.getItem(Rid) === 'true';

        if (sendTime !== 'Sch') {
            textmail = `${RUser}\nInstant ${Relname} Date:${currentTime} ${isOn ? 'OFF' : 'ON'} Successfully`;
            await inserDB(RUser, Relname.slice(-1), isOn ? 'OFF' : 'ON', currentTime, 'Instant');
        } else {
            textmail = `${RUser}\nScheduled ${Relname} Date:${currentTime} ${isOn ? 'OFF' : 'ON'} Successfully`;
            await inserDB(RUser, Relname.slice(-1), isOn ? 'OFF' : 'ON', currentTime, 'Scheduled');
        }

        await msg_Inst(textmail, Relname);
    } catch (error) {
        console.log(`Error: ${error.port}`);
        const currentTime = new Date().toString();
        let textmail = `nothing ${SchTime, localStorage.getItem(Rid)}`;
        if (sendTime !== 'Sch' && localStorage.getItem(Rid) !== 'true') {
            textmail = `${RUser}\nInstant ${Relname} Date:${currentTime} ON Successfully`;
            await inserDB(RUser, Relname.slice(-1), 'ON', currentTime, 'Instant');
        } else if (sendTime !== 'Sch' && localStorage.getItem(Rid) !== 'false') {
            textmail = `${RUser}\nInstant ${Relname} Date:${currentTime} OFF Successfully`;
            await inserDB(RUser, Relname.slice(-1), 'OFF', currentTime, 'Instant');
        } else if (sendTime === 'Sch' && localStorage.getItem(Rid) !== 'true') {
            textmail = `${RUser}\nScheduled ${Relname} Date:${currentTime} ON Successfully`;
        } else if (sendTime === 'Sch' && localStorage.getItem(Rid) !== 'false') {
            textmail = `${RUser}\nScheduled ${Relname} Date:${currentTime} OFF Successfully`;
        }
        await msg_Inst(textmail, Relname);
    }
}




async function fetchData() {
    return new Promise((resolve, reject) => {
        request(apiOptions, (err, res, body) => {
            if (err) {
                reject(err);
            } else {
                const data = JSON.parse(body);
                resolve(data.reverse());
            }
        });
    });
}

app.get('/filter', async (req, res) => {
    const filters = req.query;
    try {
        const data = await fetchData();
        const filteredData = data.filter((item) => {
            for (const key in filters) {
                if (item[key] !== filters[key]) {
                    return false;
                }
            }
            return true;
        });
        res.send(filteredData);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching data');
    }
});

app.get('/names', async (req, res) => {
    try {
        const data = await fetchData();
        const uniqueData = getUniqueListByData(data, 'alertId');
        res.send(uniqueData);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching data');
    }
});

function getUniqueListByData(data, key) {
    return [...new Map(data.map((item) => [item[key], item])).values()];
}



// Create a function to handle the relay requests
function createRelayHandler(pinNumber, relayName, relayId) {
    return async function (req, res) {
        const statusExists = req && req.body && req.body.status != null;
        const status = statusExists ? req.body.status.toString() == "true" : false;
        console.log(`Sta:${req.body.status.toString()}`);
        gpiopw.setup(pinNumber, gpiopw.DIR_OUT).then(() => {
            return gpiopw.write(pinNumber, status);
        }).catch((err) => {
            console.log(`error:${err.toString()}`);
        });
        if (status == true) {
            localStorage.setItem(relayId, 'true');
            console.log(`T${status}`);
        } else {
            localStorage.setItem(relayId, 'false');
            console.log(`F${status}`);
        }
        let sendTime = relayId.slice(-1);
        time(sendTime, relayName, relayId, req.body.name.toString());
        res.send(status);
    }
}

// Define the relay routes using the handler function
app.post('/switchLedR1', createRelayHandler(29, 'Relay_1', 'R1'));
app.get('/statR1', (req, res) => {
    console.log(localStorage.getItem('R1'));
    res.send(localStorage.getItem('R1'));
});

app.post('/switchLedR2', createRelayHandler(31, 'Relay_2', 'R2'));
app.get('/statR2', (req, res) => {
    console.log(localStorage.getItem('R2'));
    res.send(localStorage.getItem('R2'));
});

app.post('/switchLedR3', createRelayHandler(33, 'Relay_3', 'R3'));
app.get('/statR3', (req, res) => {
    console.log(localStorage.getItem('R3'))
    res.send(localStorage.getItem('R3'));
});

app.post('/switchLedR4', createRelayHandler(36, 'Relay_4', 'R4'));
app.get('/statR4', (req, res) => {
    console.log(localStorage.getItem('R4'))
    res.send(localStorage.getItem('R4'));
});

app.post('/switchLedR5', createRelayHandler(35, 'Relay_5', 'R5'));
app.get('/statR5', (req, res) => {
    console.log(localStorage.getItem('R5'))
    res.send(localStorage.getItem('R5'));
});

app.post('/switchLedR6', createRelayHandler(38, 'Relay_6', 'R6'));
app.get('/statR6', (req, res) => {
    console.log(localStorage.getItem('R6'))
    res.send(localStorage.getItem('R6'));
});

app.post('/switchLedR7', createRelayHandler(40, 'Relay_7', 'R7'));
app.get('/statR7', (req, res) => {
    console.log(localStorage.getItem('R7'))
    res.send(localStorage.getItem('R7'));
});

app.post('/switchLedR8', createRelayHandler(37, 'Relay_8', 'R8'));
app.get('/statR8', (req, res) => {
    console.log(localStorage.getItem('R8'))
    res.send(localStorage.getItem('R8'));
});

async function triggeron(Rpin, Relname, Rid, RUser, RCom, triggeronTime, RuserFrom, RuserTo, Rgrafnew, Rgrafprev, RcretedTime, RtimeDelay) {
    const [R1, R2, R3, R4, R5, R6, R7, R8] = Object.entries(localStorage)
        .filter(([key]) => key.startsWith('R') && key !== Rid)
        .map(([_, value]) => value === 'true' ? 'OFF' : 'ON');
    const RCheckTime = new Date().toString().replace('GMT+0530 (India Standard Time)', '') + new Date().getMilliseconds();
    await gpiopw.setup(Rpin, gpiopw.DIR_OUT);
    await gpiopw.write(Rpin, false);
    let sendTime = 'Sch';
    if (Rgrafnew) {
        await msg(Relname, Rid, RUser, RCom, triggeronTime, RuserFrom, RuserTo, Rgrafnew, Rgrafprev, RcretedTime, RtimeDelay, RCheckTime, R1, R2, R3, R4, R5, R6, R7, R8);
    } else {
        time(sendTime, Relname, Rid, RUser);
    }
}

async function triggeroff(Rpin, Relname, Rid, RUser, RCom, triggeronTime, RuserFrom, RuserTo, Rgrafnew, Rgrafprev, RcretedTime, RtimeDelay) {
    const [R1, R2, R3, R4, R5, R6, R7, R8] = Object.entries(localStorage)
        .filter(([key]) => key.startsWith('R') && key !== Rid)
        .map(([_, value]) => value === 'true' ? 'OFF' : 'ON');
    const RCheckTime = new Date().toString().replace('GMT+0530 (India Standard Time)', '') + new Date().getMilliseconds();
    localStorage.setItem(Rid, 'true');
    await gpiopw.setup(Rpin, gpiopw.DIR_OUT);
    await gpiopw.write(Rpin, true);
    let sendTime = 'Sch';
    if (Rgrafnew) {
        await msg(Relname, Rid, RUser, RCom, triggeronTime, RuserFrom, RuserTo, Rgrafnew, Rgrafprev, RcretedTime, RtimeDelay, RCheckTime, R1, R2, R3, R4, R5, R6, R7, R8);
    } else {
        time(sendTime, Relname, Rid, RUser);
    }
}




async function getonData() {
    const url = 'http://localhost/Sky/findOnBadge.php';
    try {
        const response = await axios.get(url);
        const getON = response.data;
        const now = new Date();
        const dayList = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const today = dayList[new Date().getDay()];
        for (const data of getON) {
            const { USERNAME, DATETIME, RELAY, DAYS } = data;
            const onvalue = date.format(now, 'YYYY-MM-DD HH:mm');
            const dbDays = DAYS.split(', ');
            const isdaysMatch = dbDays.includes(today) || DAYS.trim().length === 0;
            const relays = [
                { id: 'R1', pin: 29, name: 'Relay_1' },
                { id: 'R2', pin: 31, name: 'Relay_2' },
                { id: 'R3', pin: 33, name: 'Relay_3' },
                { id: 'R4', pin: 36, name: 'Relay_4' },
                { id: 'R5', pin: 35, name: 'Relay_5' },
                { id: 'R6', pin: 38, name: 'Relay_6' },
                { id: 'R7', pin: 40, name: 'Relay_7' },
                { id: 'R8', pin: 37, name: 'Relay_8' }
            ];
            const relay = relays.find(r => r.id === `R${RELAY}` && localStorage.getItem(r.id) !== "false" && onvalue === DATETIME && isdaysMatch);
            if (relay) {
                await triggeron(relay.pin, relay.name, relay.id, USERNAME);
            } else {
                console.log("onunsuccess");
            }
        }
    } catch (error) {
        console.log("Error Url", error);
    }
}

async function getoffData() {
    const url = 'http://localhost/Sky/findOffBadge.php';
    try {
        const response = await axios.get(url);
        const getOFF = response.data;
        const now = new Date();
        const dayList = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const today = dayList[new Date().getDay()];
        for (const data of getOFF) {
            const { USERNAME, DATETIME, RELAY, DAYS } = data;
            const offvalue = date.format(now, 'YYYY-MM-DD HH:mm');
            const dbDays = DAYS.split(', ');
            const isdaysMatch = dbDays.includes(today) || DAYS.trim().length === 0;
            const relays = [
                { id: 'R1', pin: 29, name: 'Relay_1' },
                { id: 'R2', pin: 31, name: 'Relay_2' },
                { id: 'R3', pin: 33, name: 'Relay_3' },
                { id: 'R4', pin: 36, name: 'Relay_4' },
                { id: 'R5', pin: 35, name: 'Relay_5' },
                { id: 'R6', pin: 38, name: 'Relay_6' },
                { id: 'R7', pin: 40, name: 'Relay_7' },
                { id: 'R8', pin: 37, name: 'Relay_8' }
            ];
            const relay = relays.find(r => r.id === `R${RELAY}` && localStorage.getItem(r.id) !== "true" && offvalue === DATETIME && isdaysMatch);
            if (relay) {
                await triggeroff(relay.pin, relay.name, relay.id, USERNAME);
            } else {
                console.log("offunsuccess");
            }
        }
    } catch (error) {
        console.log("Error Url", error);
    }
}



//   ----------------getApiData

async function getApiData() {
    const options = {
        url: "http://localhost:3000/api/annotations",
        headers: {
            Authorization: "Bearer eyJrIjoiQ0Y5eVp1ODdvRmloMXptVTNnRmFyT3ZmYjNsT1RiZG0iLCJuIjoicmVsYXlhcGkiLCJpZCI6MX0=",
            "content-type": "application/json",
            Accept: "application/json",
        },
        rejectUnauthorized: false,
    };

    try {
        const response = await new Promise((resolve, reject) => {
            request(options, (err, res) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(res);
                }
            });
        });
        const annotations = JSON.parse(response.body).reverse();

        if (!annotations || annotations.length === 0) {
            console.log("No annotations found.");
            return [];
        }
        function getUniqueListByData(items, key) {
            return [...new Map(items.map(item => [item[key], item])).values()];
        }
        const getFilterdata = getUniqueListByData(annotations, "alertId");

        return getFilterdata;
    } catch (error) {
        console.error(error);
        return [];
    }
}


async function getRelayStateAlerts() {
    try {
        const response = await axios.get('http://localhost/Sky/getAlertStates.php');
        if (response.status !== 200) {
            console.log("Error Url");
            return;
        }
        const Resp = response.data;
        if (Resp.length === 0) {
            console.log("User's not yet Create Alert's State");
            return;
        }

        const res = await axios.get('http://localhost:9000/names');
        const { data: getFil } = res;
        if (getFil.length === 0) {
            console.log('Filter data is Zero');
            return;
        }

        await Promise.all([
            getrelay1.getStateAlerts(getFil, Resp),
            getrelay2.getStateAlerts(getFil, Resp),
            getrelay3.getStateAlerts(getFil, Resp),
            getrelay4.getStateAlerts(getFil, Resp),
            getrelay5.getStateAlerts(getFil, Resp),
            getrelay6.getStateAlerts(getFil, Resp),
            getrelay7.getStateAlerts(getFil, Resp),
            getrelay8.getStateAlerts(getFil, Resp)
        ]);

    } catch (error) {
        console.error(error.message);
    }
}



//------------------------------InTerval
async function fetchData() {
    try {
        const [onData, offData, filterData] = await Promise.all([
            getonData(),
            getoffData(),
            getapi(getFilterdata),
            getRelayStateAlerts()
        ]);

        // Process the fetched data here

    } catch (error) {
        console.error(error.message);
    }
}

setInterval(fetchData, 10000);
      //-----------------------------------------





