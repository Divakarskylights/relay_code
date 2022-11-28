
const express = require('express');
const bodyParser = require('body-parser');
// const gpiop = require('rpi-gpio');
const gpiopw = require('rpi-gpio').promise;
// const { header } = require('express/lib/request');
const localStorage = require("localStorage");
// const influx = require('influx');
// const localInfluxClient = new influx.InfluxDB('http://localhost:8086/iiaphosk');
// const axios = require('axios')
const app = express();
// const cron = require('node-cron');
var cors = require('cors');
const request = require('request');
const date = require('date-and-time');
// const { STRING } = require('mysql/lib/protocol/constants/types');
var adr = 'http://worldtimeapi.org/api/timezone/Asia/Kolkata';
const nodemailer = require('nodemailer');
require('dotenv').config();
const path = require("path");
const hbs = require("nodemailer-express-handlebars");
var Gpio = require('onoff').Gpio;
const { text } = require('body-parser');
var rel1 = new Gpio(5, 'null');
var rel2 = new Gpio(6, 'null');
var rel3 = new Gpio(13, 'null');
var rel4 = new Gpio(16, 'null');
var rel5 = new Gpio(19, 'null');
var rel6 = new Gpio(20, 'null');
var rel7 = new Gpio(21, 'null');
var rel8 = new Gpio(26, 'null');

var getrelay1 = require("./relayR1");

var getrelay2 = require("./relayR2");
var getrelay3 = require("./relayR3");
var getrelay4 = require("./relayR4");
var getrelay5 = require("./relayR5");
var getrelay6 = require("./relayR6");
var getrelay7 = require("./relayR7");
var getrelay8 = require("./relayR8");

var getON = [];
var getOFF = [];
var getAlerts = [];
var now = [];
var sendTime = "";
var d2_0 = [];
var d2_1 = [];
var con = [];
var getFilterdata = [];

module.exports.triggeron = triggeron;
module.exports.triggeroff = triggeroff;

//, new triggeroff;

// const { json } = require("express/lib/response");
// const { clear } = require('localStorage');
const sleep = require('sleep-promise');


// Status of Relay's

function startup() {

    // Status of Relay 1
    if (rel1.readSync() === 0) {
        // LED.writeSync(1); //set output to 1 i.e turn led on
        console.log("ON");
        localStorage.setItem('R1', 'false');
    } else {
        console.log("OFF");
        localStorage.setItem('R1', 'true');
    }

    // Status of Relay 2
    if (rel2.readSync() === 0) {
        // LED.writeSync(1); //set output to 1 i.e turn led on
        console.log("ON");
        localStorage.setItem('R2', 'false');
    } else {
        console.log("OFF");
        localStorage.setItem('R2', 'true');
    }

    // Status of Relay 3
    if (rel3.readSync() === 0) {
        // LED.writeSync(1); //set output to 1 i.e turn led on
        console.log("ON");
        localStorage.setItem('R3', 'false');
    } else {
        console.log("OFF");
        localStorage.setItem('R3', 'true');
    }

    // Status of Relay 4
    if (rel4.readSync() === 0) {
        // LED.writeSync(1); //set output to 1 i.e turn led on
        console.log("ON");
        localStorage.setItem('R4', 'false');
    } else {
        console.log("OFF");
        localStorage.setItem('R4', 'true');
    }

    // Status of Relay 5
    if (rel5.readSync() === 0) {
        // LED.writeSync(1); //set output to 1 i.e turn led on
        console.log("ON");
        localStorage.setItem('R5', 'false');
    } else {
        console.log("OFF");
        localStorage.setItem('R5', 'true');
    }

    // Status of Relay 6
    if (rel6.readSync() === 0) {
        // LED.writeSync(1); //set output to 1 i.e turn led on
        console.log("ON");
        localStorage.setItem('R6', 'false');
    } else {
        console.log("OFF");
        localStorage.setItem('R6', 'true');
    }

    // Status of Relay 7
    if (rel7.readSync() === 0) {
        // LED.writeSync(1); //set output to 1 i.e turn led on
        console.log("ON");
        localStorage.setItem('R7', 'false');
    } else {
        console.log("OFF");
        localStorage.setItem('R7', 'true');
    }

    // Status of Relay 8
    if (rel8.readSync() === 0) {
        // LED.writeSync(1); //set output to 1 i.e turn led on
        console.log("ON");
        localStorage.setItem('R8', 'false');
    } else {
        console.log("OFF");
        localStorage.setItem('R8', 'true');
    }
}


startup();

// Mail declarations

async function msg(Relname, Rid, RCom, triggeronTime, RuserFrom, RuserTo, Rgrafnew, Rgrafprev, RcretedTime, RCheckTime, RtimeDelay, R1, R2, R3, R4, R5, R6, R7, R8) {
    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: 'skylightstesting@gmail.com',
            pass: 'xifapatnoercyles'
        }
    });

    const handlebarOptions = {
        viewEngine: {
            partialsDir: path.resolve('./views/'),
            defaultLayout: false,
        },
        viewPath: path.resolve('./views/'),
    };

    transporter.use('compile', hbs(handlebarOptions));

    let messageOptions = {
        from: 'skylightstesting@gmail.com',
        to: 'skylightstesting@gmail.com',
        subject: `Alert ${Relname}`,
        // text: textmail, 
        template: 'email', // the name of the template file i.e email.handlebars
    context:{
        Command:            RCom, 
        User_From_Alert:    RuserFrom,
        Grafana_From_Alert: Rgrafprev,
        CreatedTime:        RcretedTime,
        User_To_Alert:      RuserTo,
        Grafana_To_Alert:   Rgrafnew,
        TriggerTime:        triggeronTime,
        Check_Status:       localStorage.getItem(Rid) == "true" ? "OFF": "ON",
        Check_Time:         RCheckTime,
        R1:   R1, 
        R2: R2, 
        R3: R3,
        R4: R4,
        R5: R5,
        R6: R6,
        R7: R7,
        R8: R8,
        Delay_Time: RtimeDelay
    }
    };

    transporter.sendMail(messageOptions, function (error, info) {
        if (error) {
            throw error;
        } else {
            console.log(Relname);
            console.log('Email successfully sent!');
        }
    });
  
}


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

    // const handlebarOptions = {
    //     viewEngine: {
    //         partialsDir: path.resolve('./views/'),
    //         defaultLayout: false,
    //     },
    //     viewPath: path.resolve('./views/'),
    // };

    // transporter.use('compile', hbs(handlebarOptions));

    let messageOptions = {
        from: 'skylightstesting@gmail.com',
        to: 'skylightstesting@gmail.com',
        subject: `Alert ${Relname}`,
        text: textmail, 
    //     template: 'email', // the name of the template file i.e email.handlebars
    // context:{
    //     Command:            RCom, // replace {{name}} with Adebola
    //     User_From_Alert:    `${"User_From_Alert:", RuserFrom, "/", "Grafana_From_Alert:", Rgrafprev, "/",RcretedTime}`,
    //     User_To_Alert:      `${"User_To_Alert:",RuserTo, "/", "Grafana_To_Alert:", Rgrafnew, "/" ,RcretedTime}`,
    //     TriggerTime:        triggerR1onTime,
    //     Check_Status:       localStorage.getItem(Rid) == "true" ? "OFF": "ON",
    //     Check_Time:         RCheckTime,
    //     Dependent_Relays:   `${"R1:", R1, "R2:", R2, "R3:", R3, "R4:", R4, "R5:", R5, "R6:", R6, "R7:", R7, "R8:", R8}`,
    //     Delay_Time: RtimeDelay
    // }
    };

    transporter.sendMail(messageOptions, function (error, info) {
        if (error) {
            throw error;
        } else {
            console.log(Relname);
            console.log('Email successfully sent!');
        }
    });
  
}


// Time update

function time(sendTime, Relname, Rid) {
    request(adr, { json: true }, async (err, res, body) => {
        if (err) {
            console.log(err.port);
            return sendTime = new Date.now();
        }
        console.log(body);
        sendTime = body.datetime.slice(0, 19).replace("T", " Time: ");
        console.log(body.datetime.slice(0, 19).replace("T", " Time: "));
        var textmail = localStorage.getItem(Rid) != "true" ? `Instant ${Relname} Date:${sendTime} ON Successfully` : `Instant ${Relname} Date:${sendTime} OFF Successfully`;
        console.log(Relname);
        return msg_Inst(textmail, Relname);
    });
}



// call api filter panel data 

app.use("/filter", (req, res, next) => {
    new Promise((resolve, reject) => {
        request(
            {
                url: "http://192.168.1.93:3000/api/annotations",
                // uid/g5Z-2-kgk",
                headers: {
                    Authorization:
                        "Bearer eyJrIjoiQ0Y5eVp1ODdvRmloMXptVTNnRmFyT3ZmYjNsT1RiZG0iLCJuIjoicmVsYXlhcGkiLCJpZCI6MX0=",
                    "content-type": "application/json",
                    Accept: "application/json",
                },
                rejectUnauthorized: false,
            },
            async function (err, res) {
                if (err) {
                    return reject(err);
                    // console.error(err);
                } else {
                    con = JSON.parse(res.body);
                    if (d2_0 != null) {
                        d2_0 = con.reverse();
                        // console.log(d2_0);
                        return resolve(d2_0)
                    } else {
                        console.log('ALert is Empty');
                    }
                }
            }
        );
    })
    const filters = req.query;
    const filteredUsers = con.filter((user) => {
        let isValid = true;
        for (key in filters) {
            isValid = isValid && user[key] == filters[key];
        }
        return isValid;
    });
    console.log(filteredUsers);
    res.send(filteredUsers);
});


// post api data
app.use("/names", (req, res, next) => {
    new Promise((resolve, reject) => {
        request(
            {
                url: "http://192.168.1.93:3000/api/annotations",
                // uid/g5Z-2-kgk",
                headers: {
                    Authorization:
                        "Bearer eyJrIjoiQ0Y5eVp1ODdvRmloMXptVTNnRmFyT3ZmYjNsT1RiZG0iLCJuIjoicmVsYXlhcGkiLCJpZCI6MX0=",
                    "content-type": "application/json",
                    Accept: "application/json",
                },
                rejectUnauthorized: false,
            },
            async function (err, res) {
                if (err) {
                    // console.error(err)
                    return reject(err);
                } else {
                    con = JSON.parse(res.body);
                    if (d2_0 != null) {
                        d2_0 = con.reverse();
                        return resolve(d2_0);
                    } else {
                        console.log("Alert is Empty");
                    }
                }
            }
        );
    });

    function getUniqueListBydata(d2_0, key) {
        return [...new Map(d2_0.map((item) => [item[key], item])).values()];
    }
    getFilterdata = getUniqueListBydata(d2_0, "alertId");
    // console.log("Unique by place");
    for (let x = 0; x < getFilterdata.length; x++) {
        // console.log(`Data: ${JSON.stringify(getFilterdata[0].id)}`);
        // console.log(`Data:${getFilterdata}`);
    }
    res.send(getFilterdata);
});

app.use(bodyParser.json());

// relay1 get and post request
app.post('/switchLedR1', async function (req, res) {
    const statusExits = req && req.body && req.body.status != null;
    const status = statusExits ? req.body.status.toString() == "true" : false;
    console.log(`Sta:${req.body.status.toString()}`);
    gpiopw.setup(29, gpiopw.DIR_OUT).then(() => {
        return gpiopw.write(29, status);
    }).catch((err) => {
        console.log(`error:${err.toString()}`);
    });
    if (status == true) {
        localStorage.setItem('R1', 'true');
        console.log(`T${status}`);
    } else {
        localStorage.setItem('R1', 'false');
        console.log(`F${status}`);
    }
    let Relname = 'Relay_1';
    let Rid = 'R1';
    time(sendTime, Relname, Rid);
    res.send(status);
});

app.get('/statR1', (req, res) => {
    console.log(localStorage.getItem('R1'));
    res.send(localStorage.getItem('R1'));
});


// relay2 get and post request
app.post('/switchLedR2', async function (req, res) {
    const statusExits = req && req.body && req.body.status != null;
    const status = statusExits ? req.body.status.toString() == "true" : false;
    console.log(`Sta:${req.body.status.toString()}`);
    gpiopw.setup(31, gpiopw.DIR_OUT).then(() => {
        return gpiopw.write(31, status);
    }).catch((err) => {
        console.log(`error:${err.toString()}`);
    });
    if (status == true) {
        localStorage.setItem('R2', 'true');
        console.log(`T${status}`);
    } else {
        localStorage.setItem('R2', 'false');
        console.log(`F${status}`);
    }
    let Relname = 'Relay_2';
    let Rid = 'R2';
    time(sendTime, Relname, Rid);
    res.send(status);
});

app.get('/statR2', (req, res) => {
    console.log(localStorage.getItem('R2'));
    res.send(localStorage.getItem('R2'));
});


// relay3 get and post request
app.post('/switchLedR3', async function (req, res) {
    const statusExits = req && req.body && req.body.status != null;
    const status = statusExits ? req.body.status.toString() == "true" : false;
    console.log(`Sta:${req.body.status.toString()}`);
    gpiopw.setup(33, gpiopw.DIR_OUT).then(() => {
        return gpiopw.write(33, status);
    }).catch((err) => {
        console.log(`error:${err.toString()}`);
    });
    if (status == true) {
        localStorage.setItem('R3', 'true');
        console.log(`T${status}`);
    } else {
        localStorage.setItem('R3', 'false');
        console.log(`F${status}`);
    }
    let Relname = 'Relay_3';
    let Rid = 'R3';
    time(sendTime, Relname, Rid);
    res.send(status);
});

app.get('/statR3', (req, res) => {
    console.log(localStorage.getItem('R3'))
    res.send(localStorage.getItem('R3'));
});


// relay4 get and post request
app.post('/switchLedR4', async function (req, res) {
    const statusExits = req && req.body && req.body.status != null;
    const status = statusExits ? req.body.status.toString() == "true" : false;
    console.log(`Sta:${req.body.status.toString()}`);
    gpiopw.setup(36, gpiopw.DIR_OUT).then(() => {
        return gpiopw.write(36, status);
    }).catch((err) => {
        console.log(`error:${err.toString()}`);
    });
    if (status == true) {
        localStorage.setItem('R4', 'true');
        console.log(`T${status}`);
    } else {

        localStorage.setItem('R4', 'false');
        console.log(`F${status}`);
    }
    let Relname = 'Relay_4';
    let Rid = 'R4';
    time(sendTime, Relname, Rid);
    res.send(status);
});

app.get('/statR4', (req, res) => {
    console.log(localStorage.getItem('R4'))
    res.send(localStorage.getItem('R4'));
});


// relay5 get and post request
app.post('/switchLedR5', async function (req, res) {
    const statusExits = req && req.body && req.body.status != null;
    const status = statusExits ? req.body.status.toString() == "true" : false;
    console.log(`Sta:${req.body.status.toString()}`);
    gpiopw.setup(35, gpiopw.DIR_OUT).then(() => {
        return gpiopw.write(35, status);
    }).catch((err) => {
        console.log(`error:${err.toString()}`);
    });
    if (status == true) {

        localStorage.setItem('R5', 'true');
        console.log(`T${status}`);
    } else {

        localStorage.setItem('R5', 'false');
        console.log(`F${status}`);
    }
    let Relname = 'Relay_5';
    let Rid = 'R5';
    time(sendTime, Relname, Rid);
    res.send(status);
});

app.get('/statR5', (req, res) => {
    console.log(localStorage.getItem('R5'))
    res.send(localStorage.getItem('R5'));
});


// relay6 get and post request
app.post('/switchLedR6', async function (req, res) {
    const statusExits = req && req.body && req.body.status != null;
    const status = statusExits ? req.body.status.toString() == "true" : false;
    console.log(`Sta:${req.body.status.toString()}`);
    gpiopw.setup(38, gpiopw.DIR_OUT).then(() => {
        return gpiopw.write(38, status);
    }).catch((err) => {
        console.log(`error:${err.toString()}`);
    });
    if (status == true) {

        localStorage.setItem('R6', 'true');
        console.log(`T${status}`);
    } else {

        localStorage.setItem('R6', 'false');
        console.log(`F${status}`);
    }
    let Relname = 'Relay_6';
    let Rid = 'R6';
    time(sendTime, Relname, Rid);
    res.send(status);
});

app.get('/statR6', (req, res) => {
    console.log(localStorage.getItem('R6'))
    res.send(localStorage.getItem('R6'));
});


// relay7 get and post request
app.post('/switchLedR7', async function (req, res) {
    const statusExits = req && req.body && req.body.status != null;
    const status = statusExits ? req.body.status.toString() == "true" : false;
    console.log(`Sta:${req.body.status.toString()}`);
    gpiopw.setup(40, gpiopw.DIR_OUT).then(() => {
        return gpiopw.write(40, status);
    }).catch((err) => {
        console.log(`error:${err.toString()}`);
    });
    if (status == true) {

        localStorage.setItem('R7', 'true');
        console.log(`T${status}`);
    } else {

        localStorage.setItem('R7', 'false');
        console.log(`F${status}`);
    }
    let Relname = 'Relay_7';
    let Rid = 'R7';
    time(sendTime, Relname, Rid);
    res.send(status);
});

app.get('/statR7', (req, res) => {
    console.log(localStorage.getItem('R7'))
    res.send(localStorage.getItem('R7'));
});


// relay8 get and post request
app.post('/switchLedR8', async function (req, res) {
    const statusExits = req && req.body && req.body.status != null;
    const status = statusExits ? req.body.status.toString() == "true" : false;
    console.log(`Sta:${req.body.status.toString()}`);
    gpiopw.setup(37, gpiopw.DIR_OUT).then(() => {
        return gpiopw.write(37, status);
    }).catch((err) => {
        console.log(`error:${err.toString()}`);
    });
    if (status == true) {

        localStorage.setItem('R8', 'true');
        console.log(`T${status}`);
    } else {

        localStorage.setItem('R8', 'false');
        console.log(`F${status}`);
    }
    let Relname = 'Relay_8';
    let Rid = 'R8';
    time(sendTime, Relname, Rid);
    res.send(status);
});

app.get('/statR8', (req, res) => {
    console.log(localStorage.getItem('R8'))
    res.send(localStorage.getItem('R8'));
});

app.listen(9000);
console.log('server started on port 9000');



// Trigger Relay's ON

async function triggeron(Rpin, Relname, RCom, triggeronTime, Rid, RuserFrom, RuserTo, Rgrafnew, Rgrafprev, RcretedTime,  RtimeDelay) {
    return gpiopw.setup(Rpin, gpiopw.DIR_OUT).then(async () => {
        localStorage.setItem(Rid, 'false');
        // console.log(`onnnn${localStorage.setItem('R1', signalR1)}`);
        
        let R1 = localStorage.getItem('R1') == "true" ? "OFF" : "ON";
        let R2 = localStorage.getItem('R2') == "true" ? "OFF" : "ON";
        let R3 = localStorage.getItem('R3') == "true" ? "OFF" : "ON";
        let R4 = localStorage.getItem('R4') == "true" ? "OFF" : "ON"; 
        let R5 = localStorage.getItem('R5') == "true" ? "OFF" : "ON";
        let R6 = localStorage.getItem('R6') == "true" ? "OFF" : "ON";
        let R7 = localStorage.getItem('R7') == "true" ? "OFF" : "ON";
        let R8 = localStorage.getItem('R8') == "true" ? "OFF" : "ON";
        let dd = new Date().getMilliseconds();
        let RCheckTime =  new Date().toString().replace("GMT+0530 (India Standard Time)","")+ dd;
        // var textmail = `Command : ${triggerR1onTime} - ${Relname} ON Successfully `;
        await msg(Relname, Rid, RCom, triggeronTime, RuserFrom, RuserTo, Rgrafnew, Rgrafprev, RcretedTime, RCheckTime, RtimeDelay, R1, R2, R3, R4, R5, R6, R7, R8);
        // console.log(`ON${signalR1}`);
        // console.log("onsuccess" + getONdata);
        localStorage.setItem(Rid, 'false');
        return gpiopw.write(Rpin, false);
    }).catch((err) => {
        console.log(`error:${err.toString()}`);
    });
}


// Trigger Relay's OFF

async function triggeroff(Rpin, Relname, RCom, triggeronTime, Rid, RuserFrom, RuserTo, Rgrafnew, Rgrafprev, RcretedTime,  RtimeDelay) {
    return gpiopw.setup(Rpin, gpiopw.DIR_OUT).then(async () => {
        localStorage.setItem(Rid, 'true');
        let R1 = localStorage.getItem('R1') == "true" ? "OFF" : "ON";
        let R2 = localStorage.getItem('R2') == "true" ? "OFF" : "ON";
        let R3 = localStorage.getItem('R3') == "true" ? "OFF" : "ON";
        let R4 = localStorage.getItem('R4') == "true" ? "OFF" : "ON"; 
        let R5 = localStorage.getItem('R5') == "true" ? "OFF" : "ON";
        let R6 = localStorage.getItem('R6') == "true" ? "OFF" : "ON";
        let R7 = localStorage.getItem('R7') == "true" ? "OFF" : "ON";
        let R8 = localStorage.getItem('R8') == "true" ? "OFF" : "ON";
        let dd = new Date().getMilliseconds();
        let RCheckTime =  new Date().toString().replace("GMT+0530 (India Standard Time)","")+ dd;
        
        // var textmail = `Scheduled ${triggerR1offTime} - ${Relname} OFF Successfully`;
        await msg(Relname, Rid, RCom, triggeronTime, RuserFrom, RuserTo, Rgrafnew, Rgrafprev, RcretedTime, RCheckTime, RtimeDelay, R1, R2, R3, R4, R5, R6, R7, R8);
        // console.log(`OFF${signalR1}`);
        // console.log("offsuccess" + getOFFdata);
        localStorage.setItem(Rid, 'true')
        return gpiopw.write(Rpin, true);
    }).catch((err) => {
        console.log(`error:${err.toString()}`);
    });
}




async function getonData() {
    url = 'http://192.168.1.93/Sky/findOnBadge.php';
    request(url, async (error, response, body) => {
        if (!error && response.statusCode === 200) {
            const Response = JSON.parse(body)
            getON = Response;
            // console.log(getON);
            now = new Date();
            for (let x = 0; x < getON.length; x++) {
                // const getONdata = getON[x].ONDATE + getON[x].ONTIME;
                const getONdata = getON[x].DATETIME;
                const getONRelay = getON[x].RELAY;
                const onvalue = date.format(now, 'YYYY-MM-DD HH:mm');
                // console.log("current date and time : " + onvalue);
                // console.log(getONdata);
                // console.log(`Relayssssss${getONRelay.length}`);
                if (onvalue == getONdata && localStorage.getItem('R1') != "false" && getONRelay == "") {
                    let Rpin = 29;
                    let Relname = 'Relay_1';
                    let Rid = 'R1'
                    await triggeron(Rpin, Relname, Rid);
                }
                else if (onvalue == getONdata && localStorage.getItem('R2') != "false" && getONRelay == 2) {
                    let Rpin = 31;
                    let Relname = 'Relay_2';
                    let Rid = 'R2'
                    await triggeron(Rpin, Relname, Rid);
                } else if (onvalue == getONdata && localStorage.getItem('R3') != "false" && getONRelay == 3) {
                    let Rpin = 33;
                    let Relname = 'Relay_3';
                    let Rid = 'R3'
                    await triggeron(Rpin, Relname, Rid);
                } else if (onvalue == getONdata && localStorage.getItem('R4') != "false" && getONRelay == 4) {
                    let Rpin = 36;
                    let Relname = 'Relay_4';
                    let Rid = 'R4'
                    await triggeron(Rpin, Relname, Rid);
                } else if (onvalue == getONdata && localStorage.getItem('R5') != "false" && getONRelay == 5) {
                    let Rpin = 35;
                    let Relname = 'Relay_5';
                    let Rid = 'R5'
                    await triggeron(Rpin, Relname, Rid);
                }
                else if (onvalue == getONdata && localStorage.getItem('R6') != "false" && getONRelay == 6) {
                    let Rpin = 38;
                    let Relname = 'Relay_6';
                    let Rid = 'R6'
                    await triggeron(Rpin, Relname, Rid);
                }
                else if (onvalue == getONdata && localStorage.getItem('R7') != "false" && getONRelay == 7) {
                    let Rpin = 40;
                    let Relname = 'Relay_7';
                    let Rid = 'R7'
                    await triggeron(Rpin, Relname, Rid);
                }
                else if (onvalue == getONdata && localStorage.getItem('R7') != "false" && getONRelay == 8) {
                    let Rpin = 37;
                    let Relname = 'Relay_8';
                    let Rid = 'R8'
                    await triggeron(Rpin, Relname, Rid);
                }
                else {

                    //  console.log("onunsuccess");

                }
            }
        } else {
            console.log("Error Url");
        }
    });
}



async function getoffData() {
    url = 'http://192.168.1.93/Sky/findOffBadge.php';
    request(url, async (error, response, body) => {
        if (!error && response.statusCode === 200) {
            const Response = JSON.parse(body)
            getOFF = Response;
            now = new Date();
            for (let x = 0; x < getOFF.length; x++) {
                // const getOFFdata = getOFF[x].OFFDATE + getOFF[x].OFFTIME;
                const getOFFdata = getOFF[x].DATETIME;
                const getOFFRelay = getOFF[x].RELAY;
                const offvalue = date.format(now, 'YYYY-MM-DD HH:mm');
                // console.log("current date and time : " + offvalue);
                // console.log(getOFFdata);
                // console.log(`${signalR1}`);
                if (offvalue == getOFFdata && localStorage.getItem('R1') != "true" && getOFFRelay == "") {
                    let Rpin = 29;
                    let Relname = 'Relay_1';
                    let Rid = 'R1'
                    await triggeroff(Rpin, Relname, Rid);
                } else if (offvalue == getOFFdata && localStorage.getItem('R2') != "true" && getOFFRelay == 2) {
                    let Rpin = 31;
                    let Relname = 'Relay_2';
                    let Rid = 'R2'
                    await triggeroff(Rpin, Relname, Rid);
                } else if (offvalue == getOFFdata && localStorage.getItem('R3') != "true" && getOFFRelay == 3) {
                    let Rpin = 33;
                    let Relname = 'Relay_3';
                    let Rid = 'R3'
                    await triggeroff(Rpin, Relname, Rid);
                } else if (offvalue == getOFFdata && localStorage.getItem('R4') != "true" && getOFFRelay == 4) {
                    let Rpin = 36;
                    let Relname = 'Relay_4';
                    let Rid = 'R4'
                    await triggeroff(Rpin, Relname, Rid);
                } else if (offvalue == getOFFdata && localStorage.getItem('R5') != "true" && getOFFRelay == 5) {
                    let Rpin = 35;
                    let Relname = 'Relay_5';
                    let Rid = 'R5'
                    await triggeroff(Rpin, Relname, Rid);
                } else if (offvalue == getOFFdata && localStorage.getItem('R6') != "true" && getOFFRelay == 6) {
                    let Rpin = 38;
                    let Relname = 'Relay_6';
                    let Rid = 'R6'
                    await triggeroff(Rpin, Relname, Rid);
                } else if (offvalue == getOFFdata && localStorage.getItem('R7') != "true" && getOFFRelay == 7) {
                    let Rpin = 40;
                    let Relname = 'Relay_7';
                    let Rid = 'R7'
                    await triggeroff(Rpin, Relname, Rid);
                } else if (offvalue == getOFFdata && localStorage.getItem('R8') != "true" && getOFFRelay == 8) {
                    let Rpin = 37;
                    let Relname = 'Relay_8';
                    let Rid = 'R8'
                    await triggeroff(Rpin, Relname, Rid);
                } else {
                    //  console.log("offunsuccess");
                }
            }
        } else {
            console.log("Error Url");
        }
    });
}
function gg() {
    console.log("hello");
}


setInterval(async () => {
    await getonData();
    await getoffData();
    await getapi(getFilterdata);
    // await apiinflux(getFilterdata)
    url = 'http://192.168.1.93/Sky/getAlertStates.php';
    request(url, async (error, response, body) => {
        if (!error && response.statusCode === 200) {
            var Resp = JSON.parse(body)
            // console.log(`njnfjnfjnf${Resp.length}`);
        } else {
            console.log("Error Url");
        }
        if (Resp.length > 0) {
            request({
                method: 'GET',
                url: 'http://192.168.1.93:9000/names'
            }, async function (err, res) {
                if (err) return console.error(err.message);
                var getFil = JSON.parse(res.body);
                console.log(`AAAAAAAAA${getFil.length})`);
                if (getFil.length > 0 && Resp.length > 0) {
                    getrelay1.getStateAlerts(getFil, Resp);
                    getrelay2.getStateAlerts(getFil, Resp);
                    getrelay3.getStateAlerts(getFil, Resp);
                    getrelay4.getStateAlerts(getFil, Resp);
                    getrelay5.getStateAlerts(getFil, Resp);
                    getrelay6.getStateAlerts(getFil, Resp);
                    getrelay7.getStateAlerts(getFil, Resp);
                    getrelay8.getStateAlerts(getFil, Resp);
                    // tDelay1 == tDelay1num ?
                    // await getStateAlerts(getFil, Resp)
                    // : await getStateAlerts(getFil, Resp);
                } else {
                    console.log('Filter data is Zero');
                }
            });
        } else {
            console.log("User's not yet Create Alert's State");
        }
    }
    )
}, 10000);


async function getapi(getFilterdata) {
    new Promise((resolve, reject) => {
        request(
            {
                url: "http://192.168.1.93:3000/api/annotations",
                // uid/g5Z-2-kgk",
                headers: {
                    Authorization:
                        "Bearer eyJrIjoiQ0Y5eVp1ODdvRmloMXptVTNnRmFyT3ZmYjNsT1RiZG0iLCJuIjoicmVsYXlhcGkiLCJpZCI6MX0=",
                    "content-type": "application/json",
                    Accept: "application/json",
                },
                rejectUnauthorized: false,
            },
            async function (err, res) {
                if (err) {
                    // console.error(err);
                    return reject(err);
                } else {
                    con = JSON.parse(res.body);
                    // console.log(con);
                    if (d2_0 != null) {
                        d2_0 = con.reverse();
                        return resolve(d2_0);
                    } else {
                        console.log("Alert is Empty");
                    }
                }
            }
        );
    });
    function getUniqueListBydata(d2_0, key) {
        return [...new Map(d2_0.map((item) => [item[key], item])).values()];
    }
    getFilterdata = getUniqueListBydata(d2_0, "alertId");
    // console.log("Unique by place");
    for (let x = 0; x < getFilterdata.length; x++) {
        // console.log(`Data: ${JSON.stringify(getFilterdata[x].id)}`);
        // console.log(`Data:${getFilterdata}`);
    }
}
//