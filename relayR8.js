const influx = require('influx');
const localInfluxClient = new influx.InfluxDB('http://localhost:8086/staroffice');
const localStorage = require("localStorage");
const triggeronSwitch8 = require('./relay_api');
const sleep = require('sleep-promise');
const { isEmpty } = require('underscore');
module.exports.getStateAlerts = getStateAlerts;

var waitR7check = "";

var tDelayR8 = null;
var tLoopR8_3 = true;

async function getStateAlerts(getFil, Resp) {


    // --------------filter using RelayNumber_2-----------------
    var filterRelay8 = Resp.filter((item) => item.RELAYNUM == '8');

    //Check Relay_2 Available
    if (filterRelay8.length > 0) {
        for (let i = 0; i < filterRelay8.length; i++) {
            let element_1 = filterRelay8[i];
            console.log(`UserApiR8${JSON.stringify(element_1)}`);

            // filter using AlertID
            var getapiidataR8 = getFil.filter((items) => items.alertId == element_1.alertId)
            for (let index = 0; index < getapiidataR8.length; index++) {
                let element_2 = getapiidataR8[index];
                console.log(`grafApiR8${JSON.stringify(element_2)}`);

                //check id using influx Database
                localInfluxClient.query('SELECT * FROM alertApi').then(async (items) => {
                    const aa = items.filter(function (e) {
                        return e.id == element_2.id;
                    });

                    //Grafana APIId check & Waiting Condition 

                    if (aa.length > 0) {
                        console.log("_________________________");
                        console.log("Relay_8 Id's Found");
                    } else {
                        console.log("Relay_8 id's Not Found");
                        if (element_1.FROMALERTSTATE == element_2.prevState && element_1.TOALERTSTATE == element_2.newState || element_1.FROMALERTSTATE == "Any" && element_1.TOALERTSTATE == "Any" || element_1.FROMALERTSTATE == "Any" && element_1.TOALERTSTATE == element_2.newState || element_1.FROMALERTSTATE == element_2.prevState && element_1.TOALERTSTATE == "Any") {
                            let tLoopR8_1 = true;
                            let tLoopR8_2 = tLoopR8_3;
                            console.log(`First${tLoopR8_1}, Sec${tLoopR8_2}, Thir${tLoopR8_3}`);
                            if (tLoopR8_1 == tLoopR8_2) {

                                tLoopR8_3 = false;
                                var setTR7 = element_1.TIMEDELAY + "000" >= 3000 ? element_1.TIMEDELAY + "000" - 1000 : element_1.TIMEDELAY + "000";
                                console.log(`R1vdvddvdvDependent${element_1.R1}, localhostR1${localStorage.getItem('R1')}, localhostR2${localStorage.getItem('R2')}, R1STATE${element_1.RELAYSTATE}, tLoopR8_1-${tLoopR8_1}, tLoopR8_2-${tLoopR8_2}, tLoopR8_3-${tLoopR8_3}`);
                                writeDataToCloud(element_2);
                                waitR7check = setTimeout(async () => {
                                    if (element_1.RELAYSTATE == "ON" && localStorage.getItem("R8") == "true") {
                                        let Rpin = 37;
                                        let Relname = 'Relay_8';
                                        let Rid = 'R8';
                                        await triggeronSwitch8.triggeron(Rpin, Relname, Rid);
                                        //    await writeDataToCloud(element_2);
                                        console.log("successfully ON");
                                        tLoopR8_3 = true;
                                    } else if (element_1.RELAYSTATE == "OFF" && localStorage.getItem("R8") == "false") {
                                        let Rpin = 37;
                                        let Relname = 'Relay_8';
                                        let Rid = 'R8';
                                        await triggeronSwitch8.triggeroff(Rpin, Relname, Rid);
                                        console.log("successfully OFF");
                                        // await  writeDataToCloud(element_2);
                                        tLoopR8_3 = true;
                                    }
                                    else {
                                        console.log(`checkunsuccess`);
                                        // await  writeDataToCloud(element_2);
                                        tLoopR8_3 = true;
                                    }
                                }, element_1.TIMEDELAY + "000");
                                console.log(`TIME: ${setTR7}, ${element_1.TIMEDELAY + "000"}`);
                                console.log(`lllFirst${tLoopR8_1}, Sec${tLoopR8_2}, Thir${tLoopR8_3}`);

                                await sleep(setTR7);

                                // --------------------------------------------------------------------------------------------------------------------------------
                                //Dependent Relay_1 checking 
                                if (element_1.R1 == "offR1" && localStorage.getItem('R1') == "true") {
                                    console.log("Relay_1 already off");
                                } else if (element_1.R1 == "onR1" && localStorage.getItem('R1') == "false") {
                                    console.log("Relay_1 already on");
                                } else if (element_1.R1 == "off") {
                                    console.log("No Dependent Relay_1");
                                } else {
                                    clearTimeout(waitR7check);
                                    tLoopR8_3 = true;
                                    // writeDataToCloud(element_2);
                                    console.log("Relay_1 State Mismatch");
                                }

                                // --------------------------------------------------------------------------------------------------------------------------------
                                //Dependent Relay_2 checking 
                                if (element_1.R2 == "offR2" && localStorage.getItem('R2') == "true") {
                                    console.log("Relay_2 already off");
                                } else if (element_1.R2 == "onR2" && localStorage.getItem('R2') == "false") {
                                    console.log("Relay_3 already on");
                                } else if (element_1.R2 == "off") {
                                    console.log("No Dependent Relay_2");
                                } else {
                                    clearTimeout(waitR7check);
                                    tLoopR8_3 = true;
                                    // writeDataToCloud(element_2);
                                    console.log("Relay_2 State Mismatch");
                                }

                                // --------------------------------------------------------------------------------------------------------------------------------
                                //Dependent Relay_3 checking 
                                if (element_1.R3 == "offR3" && localStorage.getItem('R3') == "true") {
                                    console.log("Relay_3 already off");
                                } else if (element_1.R3 == "onR3" && localStorage.getItem('R3') == "false") {
                                    console.log("Relay_3 already on");
                                } else if (element_1.R3 == "off") {
                                    console.log("No Dependent Relay_3");
                                } else {
                                    clearTimeout(waitR7check);
                                    tLoopR8_3 = true;
                                    // writeDataToCloud(element_2);
                                    console.log("Relay_3 State Mismatch");
                                }

                                // --------------------------------------------------------------------------------------------------------------------------------
                                //Dependent Relay_4 checking 
                                if (element_1.R4 == "offR4" && localStorage.getItem('R4') == "true") {
                                    console.log("Relay_4 already off");
                                } else if (element_1.R4 == "onR4" && localStorage.getItem('R4') == "false") {
                                    console.log("Relay_4 already on");
                                } else if (element_1.R4 == "off") {
                                    console.log("No Dependent Relay_4");
                                } else {
                                    clearTimeout(waitR7check);
                                    tLoopR8_3 = true;
                                    // writeDataToCloud(element_2);
                                    console.log("Relay_4 State Mismatch");
                                }

                                // --------------------------------------------------------------------------------------------------------------------------------
                                //Dependent Relay_5 checking 
                                if (element_1.R5 == "offR5" && localStorage.getItem('R5') == "true") {
                                    console.log("Relay_5 already off");
                                } else if (element_1.R5 == "onR5" && localStorage.getItem('R5') == "false") {
                                    console.log("Relay_5 already on");
                                } else if (element_1.R5 == "off") {
                                    console.log("No Dependent Relay_5");
                                } else {
                                    clearTimeout(waitR7check);
                                    tLoopR8_3 = true;
                                    // writeDataToCloud(element_2);
                                    console.log("Relay_5 State Mismatch");
                                }

                                // --------------------------------------------------------------------------------------------------------------------------------
                                //Dependent Relay_6 checking 
                                if (element_1.R6 == "offR6" && localStorage.getItem('R6') == "true") {
                                    console.log("Relay_6 already off");
                                } else if (element_1.R6 == "onR6" && localStorage.getItem('R6') == "false") {
                                    console.log("Relay_6 already on");
                                } else if (element_1.R6 == "off") {
                                    console.log("No Dependent Relay_6");
                                } else {
                                    clearTimeout(waitR7check);
                                    tLoopR8_3 = true;
                                    // writeDataToCloud(element_2);
                                    console.log("Relay_6 State Mismatch");
                                }

                                // --------------------------------------------------------------------------------------------------------------------------------
                                //Dependent Relay_7 checking 
                                if (element_1.R7 == "offR7" && localStorage.getItem('R7') == "true") {
                                    console.log("Relay_7 already off");
                                } else if (element_1.R7 == "onR7" && localStorage.getItem('R7') == "false") {
                                    console.log("Relay_7 already on");
                                } else if (element_1.R7 == "off") {
                                    console.log("No Dependent Relay_7");
                                } else {
                                    clearTimeout(waitR7check);
                                    tLoopR8_3 = true;
                                    // writeDataToCloud(element_2);
                                    console.log("Relay_7 State Mismatch");
                                }
                            } else {
                                console.log("Waiting function");
                            }
                        } else {
                            console.log("Alert State Not Match");
                            console.log(`mmm${element_1.FROMALERTSTATE}, ${element_2.newState}, ${element_1.TOALERTSTATE}, ${element_2.prevState}`);
                            tLoopR8_3 = true;
                            clearTimeout(waitR7check);
                        }
                    }
                });
            }
        }
    }
    else {
        console.log(`No Relay_8: ${filterRelay8.length}`);
    }
}


async function writeDataToCloud(element_2) {
    return new Promise(function (resolve, reject) {
        if (element_2.alertId > 0) {
            // console.log(element_2.id);
            // console.log(element_2.panelId)
            localInfluxClient.writePoints([
                {
                    measurement: 'alertApi',
                    tags: {
                        hardware: "API",
                    },
                    fields: {
                        id: element_2.id,
                        alertId: element_2.alertId,
                        panelName: element_2.text.slice(0, 25),
                        panelId: element_2.panelId,
                        newState: element_2.newState,
                        prevState: element_2.prevState,
                        created: element_2.created,
                        lastEnd: element_2.timeEnd,
                        // statecheck: stateCheck
                    },
                    timestamp: element_2.created,
                }],
                {
                    database: 'staroffice',
                    precision: 'ms',
                })
                .then(async () => {
                    // console.log(data)

                    console.log('Data inserted to cloud elm !');
                    data = []
                    resolve();
                })
                .catch(async error => {

                    console.log('Error saving data to InFlux: ' + error);
                    data = []
                    resolve();
                });
            // }
        }
        else {
            console.log('Data is null hence nothing would be stored !');
            resolve();
        }
    });
}