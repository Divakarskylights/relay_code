const fs = require('fs');
const express = require('express');
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
// const localtunnel = require('localtunnel');
const { spawn, exec, execSync } = require('child_process');
const https = require('https');
const { signOut } = require('./cookieClear');
const cookieParser = require('cookie-parser');
app.use(cookieParser());
// var localTunnelUrl = 'lt --port 3000 --subdomain myapp --print-requests --header "Bypass-Tunnel-Reminder: true"';
app.use(cors());
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'DELETE, PUT, GET, POST');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
 });
 app.use(bodyParser.urlencoded({ extended: true }));

app.use(bodyParser.json());
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
var chart = [];

module.exports.triggeron = triggeron;
module.exports.triggeroff = triggeroff;

//, new triggeroff;

// const { json } = require("express/lib/response");
// const { clear } = require('localStorage');
// const sleep = require('sleep-promise');
// const { info } = require('console');





// Status of Relay's

async function startup() {

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

var transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: 'skylightstesting@gmail.com',
        pass: 'xifapatnoercyles'
    }
});


startup();

app.get('/signout', signOut);

app.post('/contact', async (req, res) => {
    console.log(req.body);
    if (!req.body.name || !req.body.email || !req.body.message) {
      res.status(400).send('Missing required fields');
      return;
    }
  
    const { name, email, message } = req.body;
  
    try {
      // Perform any necessary validation or processing of the form data here

      const mailOptions = {
        from: email,
        to: 'skylightstesting@gmail.com',
        subject: `Contact from ${email}`,
        text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('Message sent: %s', info.messageId);
      res.status(200).send('Message sent successfully!');
    } catch (error) {
      console.error(error);
      res.status(500).send('Message failed to send.');
    }
  });
  
// Mail declarations
async function msg(Relname, Rid, RUser, RCom, triggeronTime, RuserFrom, RuserTo, Rgrafnew, Rgrafprev, RcretedTime, RtimeDelay, RCheckTime, R1, R2, R3, R4, R5, R6, R7, R8) {
    // let transporter = nodemailer.createTransport({
    //     host: 'smtp.gmail.com',
    //     port: 465,
    //     secure: true,
    //     auth: {
    //         user: 'skylightstesting@gmail.com',
    //         pass: 'xifapatnoercyles'
    //     }
    // });

    const handlebarOptions = {
        viewEngine: {
            partialsDir: path.resolve('./views/'),
            defaultLayout: false,
        },
        viewPath: path.resolve('./views/'),
    };

    transporter.use('compile', hbs(handlebarOptions));
    // res.send(status);
    let messageOptions = {
        from: 'skylightstesting@gmail.com',
        to: 'skylightstesting@gmail.com',
        subject: `Alert ${Relname} by ${RUser}`,
        // text: textmail, 
        template: 'email', // the name of the template file i.e email.handlebars
        context: {
            User: RUser,
            Command: RCom,
            User_From_Alert: RuserFrom,
            Grafana_From_Alert: Rgrafprev,
            CreatedTime: RcretedTime,
            User_To_Alert: RuserTo,
            Grafana_To_Alert: Rgrafnew,
            TriggerTime: triggeronTime,
            Check_Status: localStorage.getItem(Rid) == "true" ? "OFF" : "ON",
            Check_Time: RCheckTime,
            R1: R1,
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
            // console.log(Relname);
            console.log('Email successfully sent!');
        }
    });

}


// Mail declarations

async function msg_Inst(textmail, Relname) {
    // let transporter = nodemailer.createTransport({
    //     host: 'smtp.gmail.com',
    //     port: 465,
    //     secure: true,
    //     auth: {
    //         user: 'skylightstesting@gmail.com',
    //         pass: 'xifapatnoercyles'
    //     }
    // });

    let messageOptions = {
        from: 'skylightstesting@gmail.com',
        to: 'skylightstesting@gmail.com',
        subject: `Alert ${Relname}`,
        text: textmail,
    };
    // try {
    //     const info = await transporter.sendMail(messageOptions);
    //     console.log(`Email successfully sent to ${info.messageId}`);
    //   } catch (error) {
    //     console.error(`Error occurred while sending email to ${error}`);
    //   }


    transporter.sendMail(messageOptions, function (error, info) {
        if (error) {
            console.log(`Mail not sent Network Issue: ${error}`);
        } else {
            // console.log(Relname);
            console.log(`Email successfully sent!: ${info}`);
        }
    });

}


// Time update

function time(sendTime, Relname, Rid, RUser) {
    request(adr, { json: true }, async (err, res, body) => {
        if (err) {
            console.log(`Errorrrrrrrrrrrrrrrrrrrrrrrrrr${err.port}`);
            let currentTime = new Date.now().toString();
            if (sendTime != 'Sch' && localStorage.getItem(Rid) != "true") {
                textmail = `${RUser}\nInstant ${Relname} Date:${currentTime} ON Successfully`;
                // let dString = Relname.slice(-1);
                await inserDB(RUser, Relname.slice(-1), 'ON', currentTime, 'Instant')
            } else if (sendTime != 'Sch' && localStorage.getItem(Rid) != "false") {
                textmail = `${RUser}\nInstant ${Relname} Date:${currentTime} OFF Successfully`;
                await inserDB(RUser, Relname.slice(-1), 'ON', currentTime, 'Instant')

            } else if (sendTime == 'Sch' && localStorage.getItem(Rid) != "true") {
                textmail = `${RUser}\nScheduled ${Relname} Date:${currentTime} ON Successfully`;
            } else if (sendTime == 'Sch' && localStorage.getItem(Rid) != "false") {
                textmail = `${RUser}\nScheduled ${Relname} Date:${currentTime} OFF Successfully`;
            } else {
                textmail = `nothing ${SchTime, localStorage.getItem(Rid)}`
            }
        } else {
            let currentTime = body.datetime.slice(0, 19);
            // console.log(`TImeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee${body}`);
            if (sendTime != 'Sch' && localStorage.getItem(Rid) != "true") {
                textmail = `${RUser}\nInstant ${Relname} Date:${currentTime.replace("T", " Time: ")} ON Successfully`;
                // let dString = Relname.slice(-1);
                await inserDB(RUser, Relname.slice(-1), 'ON', currentTime.replace("T", " "), 'Instant')
            } else if (sendTime != 'Sch' && localStorage.getItem(Rid) != "false") {
                textmail = `${RUser}\nInstant ${Relname} Date:${currentTime.replace("T", " Time: ")} OFF Successfully`;
                await inserDB(RUser, Relname.slice(-1), 'OFF', currentTime.replace("T", " "), 'Instant')

            } else if (sendTime == 'Sch' && localStorage.getItem(Rid) != "true") {
                textmail = `${RUser}\nScheduled ${Relname} Date:${currentTime.replace("T", " Time: ")} ON Successfully`;
                await inserDB(RUser, Relname.slice(-1), 'ON', currentTime.replace("T", " "), 'Scheduled')
            } else if (sendTime == 'Sch' && localStorage.getItem(Rid) != "false") {
                textmail = `${RUser}\nScheduled ${Relname} Date:${currentTime.replace("T", " Time: ")} OFF Successfully`;
                await inserDB(RUser, Relname.slice(-1), 'OFF', currentTime.replace("T", " "), 'Scheduled')
            } else {
                textmail = `nothing ${SchTime, localStorage.getItem(Rid)}`
            }
        }
        return await msg_Inst(textmail, Relname);
    });
}

// call api filter panel data 
app.use("/filter", (req, res, next) => {
    new Promise((resolve, reject) => {
        request(
            {
                url: "http://localhost:3000/api/annotations",
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
    // console.log(filteredUsers);
    res.send(filteredUsers);
});


// post api data
app.use("/names", (req, res, next) => {
    new Promise((resolve, reject) => {
        request(
            {
                url: "http://localhost:3000/api/annotations",
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
            });
    });

    function getUniqueListBydata(d2_0, key) {
        return [...new Map(d2_0.map((item) => [item[key], item])).values()];
    }
    getFilterdata = getUniqueListBydata(d2_0, "alertId");
    for (let x = 0; x < getFilterdata.length; x++) {

    }
    res.send(getFilterdata);
});


// relay1 get and post request
app.post('/switchLedR1', async function (req, res) {
    const statusExits = req && req.body && req.body.status != null;
    const status = statusExits ? req.body.status.toString() == "true" : false;
    console.log(`Sta:${req.body.status.toString()}  ${req.body.name.toString()}}}`);
    gpiopw.setup(29, gpiopw.DIR_OUT).then(() => {
        return gpiopw.write(29, status);
    }).catch((err) => {
        console.log(`error:${err.toString()}`);
    });
    if (status == true) {
        localStorage.setItem('R1', 'true');

    } else {
        localStorage.setItem('R1', 'false');

    }
    let Relname = 'Relay_1';
    let Rid = 'R1';
    let sendTime = "1"
    // let RUser = ''
    time(sendTime, Relname, Rid, req.body.name.toString());
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
    let sendTime = "2"
    time(sendTime, Relname, Rid, req.body.name.toString());
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
    let sendTime = "3"
    time(sendTime, Relname, Rid, req.body.name.toString());
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
    let sendTime = "4"
    time(sendTime, Relname, Rid, req.body.name.toString());
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
    let sendTime = "5"
    time(sendTime, Relname, Rid, req.body.name.toString());
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
    let sendTime = "6"
    time(sendTime, Relname, Rid, req.body.name.toString());
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
    let sendTime = "7"
    time(sendTime, Relname, Rid, req.body.name.toString());
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
    let sendTime = "8"
    time(sendTime, Relname, Rid, req.body.name.toString());
    res.send(status);
});

app.get('/statR8', (req, res) => {
    console.log(localStorage.getItem('R8'))
    res.send(localStorage.getItem('R8'));
});

app.listen(9000);
console.log('server started on port 9000');



//influx Chart

// relay8 get and post request
app.post('/influxChart', async function (req, res) {
    const statusExits = req && req.body && req.body.status != null;
    const status = statusExits ? req.body.status.toString() : "null";
    console.log(`Sta:${req.body.status.toString()}`);
    // res.setHeader('Content-Type', 'text/html');
    localInfluxClient.query(`select * from ${status}`).then(async (api) => {
        chart = api
        console.log(`Chart ${JSON.parse(JSON.stringify(chart))}`);
        return res.send(JSON.parse(JSON.stringify(chart)));
    });
    //    return res.send(chart);
});

app.get('/infChart', (req, res) => {
    // console.log(localStorage.getItem('R8'))
    res.send(chart);
});

//MariaDB connection Insert
async function inserDB(Uname, Rname, val, dt, cause) {
    const pool = mariadb.createPool({
        host: 'localhost',
        user: 'root',
        database: 'skydb',
        password: 'sky1234',
        connectionLimit: 5
    });
    console.log(`DDDD${Uname}, ${Rname}, ${val}, '${dt}, ${cause}`);
    return pool.getConnection()
        .then(conn => {
            conn.query(`INSERT INTO history (USERNAME, RELAY, VAL, DATETIME, CAUSE) VALUES ('${Uname}', '${Rname}', '${val}', '${dt}', '${cause}');`)
                .then((rows) => {
                    console.log(rows);
                })
                .then((res) => {
                    // console.log(res); 
                    //  conn.end();
                })
                .catch(err => {
                    console.log(err);
                    conn.end();
                })
        }).catch(err => {
            console.log(`HH${err}`);
            //not connected
        });
}

//MariaDB call Quary
app.get('/onOffHistory', (req, res) => {
    const pool = mariadb.createPool({
        host: 'localhost',
        user: 'root',
        database: 'skydb',
        password: 'sky1234',
        connectionLimit: 5
    });
    //    console.log(`DDDD${Uname}, ${Rname}, ${val}, '${dt}, ${cause}`);
    pool.getConnection()
        .then(conn => {
            conn.query(`SELECT * FROM history`)
                .then((rows) => {
                    console.log(rows);
                    res.send(rows);
                })
                .then((res) => {
                    // console.log(res); 
                    //  conn. .end();
                })
                .catch(err => {

                    console.log(err);
                    conn.end();
                })

        })
    //    res.send("hh")

});

// Trigger Relay's ON

async function triggeron(Rpin, Relname, Rid, RUser, RCom, triggeronTime, RuserFrom, RuserTo, Rgrafnew, Rgrafprev, RcretedTime, RtimeDelay) {
    return gpiopw.setup(Rpin, gpiopw.DIR_OUT).then(async () => {
        console.log(`Ridddddddddddddddd: ${Rid}`);
        localStorage.setItem(Rid, 'false');
        let R1 = localStorage.getItem('R1') == "true" ? "OFF" : "ON";
        let R2 = localStorage.getItem('R2') == "true" ? "OFF" : "ON";
        let R3 = localStorage.getItem('R3') == "true" ? "OFF" : "ON";
        let R4 = localStorage.getItem('R4') == "true" ? "OFF" : "ON";
        let R5 = localStorage.getItem('R5') == "true" ? "OFF" : "ON";
        let R6 = localStorage.getItem('R6') == "true" ? "OFF" : "ON";
        let R7 = localStorage.getItem('R7') == "true" ? "OFF" : "ON";
        let R8 = localStorage.getItem('R8') == "true" ? "OFF" : "ON";
        // let dd = new Date().getMilliseconds();
        let RCheckTime = new Date().toString().replace("GMT+0530 (India Standard Time)", "") + new Date().getMilliseconds();
        return gpiopw.write(Rpin, false).then(async () => {
            console.log("Helloooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo");
            // sendTime = body.datetime.slice(0, 19).replace("T", " Time: ");
            console.log(`Rgrafnewwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww: ${Rgrafnew == null}`);
            let sendTime = 'Sch'
            Rgrafnew == null ?
                time(sendTime, Relname, Rid, RUser)
                : await msg(Relname, Rid, RUser, RCom, triggeronTime, RuserFrom, RuserTo, Rgrafnew, Rgrafprev, RcretedTime, RtimeDelay, RCheckTime, R1, R2, R3, R4, R5, R6, R7, R8);
        });
    }).catch((err) => {
        console.log(`error:${err.toString()}`);
    });
}


// Trigger Relay's OFF

async function triggeroff(Rpin, Relname, Rid, RUser, RCom, triggeronTime, RuserFrom, RuserTo, Rgrafnew, Rgrafprev, RcretedTime, RtimeDelay) {
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
        // let dd = new Date().getMilliseconds();
        let RCheckTime = new Date().toString().replace("GMT+0530 (India Standard Time)", "") + new Date().getMilliseconds();
        localStorage.setItem(Rid, 'true')
        return gpiopw.write(Rpin, true).then(async () => {
            let sendTime = 'Sch'
            Rgrafnew == null ?
                time(sendTime, Relname, Rid, RUser)
                : await msg(Relname, Rid, RUser, RCom, triggeronTime, RuserFrom, RuserTo, Rgrafnew, Rgrafprev, RcretedTime, RtimeDelay, RCheckTime, R1, R2, R3, R4, R5, R6, R7, R8);
        });
    }).catch((err) => {
        console.log(`error:${err.toString()}`);
    });
}

// async function checkDays(getONDay){
//     var dayList = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
//     var day = dayList[new Date().getDay()];
//     var dbDays = getONDay.split(', ');
//     var isdaysMatch = dbDays.
// }


async function getonData() {
    url = 'http://localhost/Sky/findOnBadge.php';
    request(url, async (error, response, body) => {
        if (!error && response.statusCode === 200) {
            // const Response 
            getON = JSON.parse(body)
            // getON = Response;
            now = new Date();
            for (let x = 0; x < getON.length; x++) {
                const getUser = getON[x].USERNAME;
                const getONdata = getON[x].DATETIME;
                const getONRelay = getON[x].RELAY;
                const getONDays = getON[x].DAYS.toString();
                const onvalue = date.format(now, 'YYYY-MM-DD HH:mm');
                var dayList = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
                var day = dayList[new Date().getDay()];
                var dbDays = getONDays.split(', ');
                var isdaysMatch = dbDays.includes(day);
                console.log("......................:", isdaysMatch, getONDays.length);
                // console.log('checkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',localStorage.getItem('R1'));
                if (onvalue == getONdata && localStorage.getItem('R1') != "false" && getONRelay == 1 && (isdaysMatch || getONDays.trim().length === 0)) {
                    let Rpin = 29;
                    let Relname = 'Relay_1';
                    let Rid = 'R1';
                    let RUser = getUser;
                    await triggeron(Rpin, Relname, Rid, getUser);
                }
                else if (onvalue == getONdata && localStorage.getItem('R2') != "false" && getONRelay == 2 && (isdaysMatch || getONDays.trim().length === 0)) {
                    let Rpin = 31;
                    let Relname = 'Relay_2';
                    let Rid = 'R2';
                    let RUser = getUser;
                    await triggeron(Rpin, Relname, Rid, getUser);
                } else if (onvalue == getONdata && localStorage.getItem('R3') != "false" && getONRelay == 3 && (isdaysMatch || getONDays.trim().length === 0)) {
                    let Rpin = 33;
                    let Relname = 'Relay_3';
                    let Rid = 'R3';
                    let RUser = getUser;
                    await triggeron(Rpin, Relname, Rid, getUser);
                } else if (onvalue == getONdata && localStorage.getItem('R4') != "false" && getONRelay == 4 && (isdaysMatch || getONDays.trim().length === 0)) {
                    let Rpin = 36;
                    let Relname = 'Relay_4';
                    let Rid = 'R4';
                    let RUser = getUser;
                    await triggeron(Rpin, Relname, Rid, getUser);
                } else if (onvalue == getONdata && localStorage.getItem('R5') != "false" && getONRelay == 5 && (isdaysMatch || getONDays.trim().length === 0)) {
                    let Rpin = 35;
                    let Relname = 'Relay_5';
                    let Rid = 'R5';
                    let RUser = getUser;
                    await triggeron(Rpin, Relname, Rid, getUser);
                }
                else if (onvalue == getONdata && localStorage.getItem('R6') != "false" && getONRelay == 6 && (isdaysMatch || getONDays.trim().length === 0)) {
                    let Rpin = 38;
                    let Relname = 'Relay_6';
                    let Rid = 'R6';
                    let RUser = getUser;
                    await triggeron(Rpin, Relname, Rid, getUser);
                }
                else if (onvalue == getONdata && localStorage.getItem('R7') != "false" && getONRelay == 7 && (isdaysMatch || getONDays.trim().length === 0)) {
                    let Rpin = 40;
                    let Relname = 'Relay_7';
                    let Rid = 'R7';
                    let RUser = getUser;
                    await triggeron(Rpin, Relname, Rid, getUser);
                }
                else if (onvalue == getONdata && localStorage.getItem('R7') != "false" && getONRelay == 8 && (isdaysMatch || getONDays.trim().length === 0)) {
                    let Rpin = 37;
                    let Relname = 'Relay_8';
                    let Rid = 'R8';
                    let RUser = getUser;
                    await triggeron(Rpin, Relname, Rid, getUser);
                }
                else {
                    console.log("onunsuccess");
                }
            }
        } else {
            console.log("Error Url");
        }
    });
}



async function getoffData() {
    url = 'http://localhost/Sky/findOffBadge.php';
    request(url, async (error, response, body) => {
        if (!error && response.statusCode === 200) {
            getOFF = JSON.parse(body);
            now = new Date();
            for (let x = 0; x < getOFF.length; x++) {
                const getUser = getOFF[x].USERNAME;
                const getOFFdata = getOFF[x].DATETIME;
                const getOFFRelay = getOFF[x].RELAY;
                const getOFFDays = getOFF[x].DAYS;
                const offvalue = date.format(now, 'YYYY-MM-DD HH:mm');
                console.log("current date and time : " + offvalue);
                console.log("nameeeeeeeeeeeeeeeeeeeeeeee : " + getUser);
                var dayList = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
                var day = dayList[new Date().getDay()];
                var dbOFFDays = getOFFDays.split(', ');
                var isOFFdaysMatch = dbOFFDays.includes(day);
                console.log("Divkaar:", isOFFdaysMatch, getOFFDays.length);
                if (offvalue == getOFFdata && localStorage.getItem('R1') != "true" && getOFFRelay == 1 && (isOFFdaysMatch || getOFFDays.trim().length === 0)) {
                    let Rpin = 29;
                    let Relname = 'Relay_1';
                    let Rid = 'R1'
                    let RUser = getUser;
                    await triggeroff(Rpin, Relname, Rid, getUser);
                } else if (offvalue == getOFFdata && localStorage.getItem('R2') != "true" && getOFFRelay == 2 && (isOFFdaysMatch || getOFFDays.trim().length === 0)) {
                    let Rpin = 31;
                    let Relname = 'Relay_2';
                    let Rid = 'R2'
                    let RUser = getUser;
                    await triggeroff(Rpin, Relname, Rid, getUser);
                } else if (offvalue == getOFFdata && localStorage.getItem('R3') != "true" && getOFFRelay == 3 && (isOFFdaysMatch || getOFFDays.trim().length === 0)) {
                    let Rpin = 33;
                    let Relname = 'Relay_3';
                    let Rid = 'R3';
                    let RUser = getUser;
                    await triggeroff(Rpin, Relname, Rid, getUser);
                } else if (offvalue == getOFFdata && localStorage.getItem('R4') != "true" && getOFFRelay == 4 && (isOFFdaysMatch || getOFFDays.trim().length === 0)) {
                    let Rpin = 36;
                    let Relname = 'Relay_4';
                    let Rid = 'R4';
                    let RUser = getUser;
                    await triggeroff(Rpin, Relname, Rid, getUser);
                } else if (offvalue == getOFFdata && localStorage.getItem('R5') != "true" && getOFFRelay == 5 && (isOFFdaysMatch || getOFFDays.trim().length === 0)) {
                    let Rpin = 35;
                    let Relname = 'Relay_5';
                    let Rid = 'R5';
                    let RUser = getUser;
                    await triggeroff(Rpin, Relname, Rid, getUser);
                } else if (offvalue == getOFFdata && localStorage.getItem('R6') != "true" && getOFFRelay == 6 && (isOFFdaysMatch || getOFFDays.trim().length === 0)) {
                    let Rpin = 38;
                    let Relname = 'Relay_6';
                    let Rid = 'R6';
                    let RUser = getUser;
                    await triggeroff(Rpin, Relname, Rid, getUser);
                } else if (offvalue == getOFFdata && localStorage.getItem('R7') != "true" && getOFFRelay == 7 && (isOFFdaysMatch || getOFFDays.trim().length === 0)) {
                    let Rpin = 40;
                    let Relname = 'Relay_7';
                    let Rid = 'R7';
                    let RUser = getUser;
                    await triggeroff(Rpin, Relname, Rid, getUser);
                } else if (offvalue == getOFFdata && localStorage.getItem('R8') != "true" && getOFFRelay == 8 && (isOFFdaysMatch || getOFFDays.trim().length === 0)) {
                    let Rpin = 37;
                    let Relname = 'Relay_8';
                    let Rid = 'R8';
                    let RUser = getUser;
                    await triggeroff(Rpin, Relname, Rid, getUser);
                } else {
                    console.log("offunsuccess");
                }
            }
        } else {
            console.log("Error Url");
        }
    });
}


setInterval(async () => {
    await getonData();
    await getoffData();
    await getapi(getFilterdata);
    // await apiinflux(getFilterdata)
    url = 'http://localhost/Sky/getAlertStates.php';
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
                url: 'http://localhost:9000/names'
            }, async function (err, res) {
                if (err) return console.error(err.message);
                var getFil = JSON.parse(res.body);
                // console.log(`AAAAAAAAA${getFil.length})`);
                if (getFil.length > 0 && Resp.length > 0) {
                    getrelay1.getStateAlerts(getFil, Resp);
                    // getrelay2.getStateAlerts(getFil, Resp);
                    // getrelay3.getStateAlerts(getFil, Resp);
                    // getrelay4.getStateAlerts(getFil, Resp);
                    // getrelay5.getStateAlerts(getFil, Resp);
                    // getrelay6.getStateAlerts(getFil, Resp);
                    // getrelay7.getStateAlerts(getFil, Resp);
                    // getrelay8.getStateAlerts(getFil, Resp);
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
                url: "http://localhost:3000/api/annotations",
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


app.get('/getMac', (req, res) => {
    
    exec("cat /proc/cpuinfo | grep Serial | cut -d ' ' -f 2", (error, stdout, stderr) => {
        if (error) {
          res.statusCode = 500;
          res.end(`Error: ${error.message}`);
        } else if (stderr) {
          res.statusCode = 500;
          res.end(`Error: ${stderr}`);
        } else {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'text/plain');
          res.end(stdout.trim());
        }
      });
});


app.get('/os', async (req, res) => {
    var DiskTotal = "";
    var DiskUsed = "";
    var DiskAvailable = "";
    const tempC = parseFloat(fs.readFileSync('/sys/class/thermal/thermal_zone0/temp', 'utf8')) / 1000;
    disk.check('/', function (err, info) {
        if (err) {
            console.log(err);
        } else {
            DiskTotal = (info.total / 1073741824).toFixed(2);
            DiskUsed = ((info.total - info.available) / 1073741824).toFixed(2);
            DiskAvailable = (info.available / 1073741824).toFixed(2);
        }
    });
    let mA =   execSync("cat /proc/cpuinfo | grep Serial | cut -d ' ' -f 2").toString().trim();//await macaddress.one();
    console.log(`GGGGG${mA}`);
    const data = {
        osTunnelUrl: await checkWebsite(`https://${mA}.loca.lt/login`),
        osDiskTotal: DiskTotal,
        osDiskUsed: DiskUsed,
        osDiskAvail: DiskAvailable,
        osHostname: mA, //.replace(/:/g, ''),
        osType: os.type(),
        osRAMFreeMem: (os.freemem() / 1073741824).toFixed(2),
        osRAMTotalMem: (os.totalmem() / 1073741824).toFixed(2),
        osWifiNetworkInterfaces: os.networkInterfaces(),
        osGateWayUpTime: formatDuration(os.uptime()),
        osUserinfo: os.userInfo().username,
        osGatewayTemp: `${tempC} °C`
    };
    res.json(data);
});

function formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours}h:${minutes}m:${remainingSeconds.toString().split('.')[0]}s`;
}

async function checkWebsite(turl) {
    return new Promise((resolve, reject) => {
      https.get(turl, async (res) => {
        if (res.statusCode === 200) {
          console.log('Website is working');
          resolve(turl);
        } else {
          console.log(`Website returned status code ${res.statusCode}`);
          let mA = execSync("cat /proc/cpuinfo | grep Serial | cut -d ' ' -f 2").toString().trim();//await macaddress.one();
          resolve(await terminalCommand(mA));
        //   resolve();
        }
      }).on('error', (err) => {
        console.error(`Error while making request: ${err}`);
        reject(err);
      });
    });
  }

function terminalCommand(mA) {
    return new Promise(async (resolve, reject) => {
        const tunnel = spawn('lt', ['--port', '3000', '--subdomain', `${mA}`, '--header : Bypass-Tunnel-Reminder: true']);
        tunnel.stdout.on('data', async(data) => {
            console.log(`stdout: ${data} ${mA}`);
            const parsedUrl = url.parse(data.toString().trim()).href;
            resolve(parsedUrl); // resolve with the tunnel URL as a string
            await insertgateWayInfo(os.userInfo().username)
          });
      
          tunnel.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`);
            reject(data.toString().trim()); // reject with any error messages as a string
          });
    });
}

async function insertgateWayInfo(gatewayName, macAdd, url) {
    const pool = mariadb.createPool({
        host: 'localhost',
        user: 'root',
        database: 'skydb',
        password: 'sky1234',
        connectionLimit: 5
    });
    console.log(`DDDD${url}`);
    return pool.getConnection()
        .then(conn => {
            conn.query(`INSERT INTO gatewayInfo (GATEWAYNAME, MACADD, URL) VALUES ('${gatewayName}', '${macAdd}', '${url}');`)
                .then((rows) => {
                    console.log(rows);
                })
                .then((res) => {
                  
                })
                .catch(err => {
                    console.log(err);
                    conn.end();
                })
        }).catch(err => {
            console.log(`HH${err}`);
            //not connected
        });
}



