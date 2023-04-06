const influx = require('influx');
const localInfluxClient = new influx.InfluxDB('http://localhost:8086/staroffice');
const localStorage = require("localStorage");
const triggeronSwitch1 = require('./relay_api');
const sleep = require('sleep-promise');
const { isEmpty } = require('underscore');
module.exports.getStateAlerts = getStateAlerts;
var infSendtoDB = require('./sendDataDB');

var waitR1check = "";
var tDelayR1 = null;
var tLoopR1_3 = true;



async function getStateAlerts(getFil, Resp) {
    // --------------filter using RelayNumber 1-----------------
    var filterRelay1 = Resp.filter((item) => item.RELAYNUM == '1');
    console.log(`filterRelay1.length${filterRelay1.length}`);
    //Check Relay_1 Available
    if (filterRelay1.length > 0) {
        for (let i = 0; i < filterRelay1.length; i++) {
            let element_1 = filterRelay1[i];
            console.log(`UserApiR1${JSON.stringify(element_1)}`);

            // filter using AlertID
            var getapiidataR1 = getFil.filter((items) => items.alertId == element_1.alertId)
            for (let index = 0; index < getapiidataR1.length; index++) {
                let element_2 = getapiidataR1[index];
                console.log(`grafApiR1${JSON.stringify(element_2.id)}`);

                //check id using influx Database
                localInfluxClient.query('SELECT * FROM alertApi').then(async (items) => {
                    const aa = items.filter(function (e) {
                        return e.id == element_2.id;
                    });
                    //Grafana APIId check & Waiting Condition
                    if (aa.length > 0) {
                        console.log("_________________________");
                        console.log(`Relay _1 Id's Found${element_1.RELAYSTATE}`);
                        console.log(element_2.created);

                        let dd = new Date().getMilliseconds();
                        let triggeronTime = new Date().toString().replace("GMT+0530 (India Standard Time)", "") + dd;
                        console.log(triggeronTime);

                        console.log(`USER_FROMSTATE: ${element_1.FROMALERTSTATE}, USER_FROMSTATE: ${element_1.TOALERTSTATE}, Graf Prev: ${element_2.prevState}, Graf new: ${element_2.newState}`);
                    } else {
                        console.log(`Relay _1 id's Not Found${element_1.RELAYSTATE}`);
                        // console.log(element_2.alertId);
                        console.log(`USER_FROMSTATE: ${element_1.FROMALERTSTATE}, USER_FROMSTATE: ${element_1.TOALERTSTATE}, Graf Prev: ${element_2.prevState}, Graf new: ${element_2.newState}`);
                        // console.log(tDelayR1);
                        if (
                            element_1.FROMALERTSTATE == element_2.prevState && element_1.TOALERTSTATE == element_2.newState ||
                            element_1.FROMALERTSTATE == "Any" && element_1.TOALERTSTATE == element_2.newState || element_1.FROMALERTSTATE == element_2.prevState && element_1.TOALERTSTATE == "Any") {
                            let tLoopR1_1 = true;
                            let tLoopR1_2 = tLoopR1_3;
                            console.log(`First${tLoopR1_1}, Sec${tLoopR1_2}, Thir${tLoopR1_3}`);
                            if (tLoopR1_1 == tLoopR1_2) {
                                tLoopR1_3 = false;
                                console.log("Two");
                                // var setTR1 = element_1.TIMEDELAY + "000" >= 3000 ? element_1.TIMEDELAY + "000" - 1000 : element_1.TIMEDELAY + "000";
                                // console.log(`R1vdvddvdvDependent${element_1.R1}, localhostR1${localStorage.getItem('R1')}, localhostR2${localStorage.getItem('R2')}, R1STATE${element_1.RELAYSTATE}, tLoopR1_1-${tLoopR1_1}, tLoopR1_2-${tLoopR1_2}, tLoopR1_3-${tLoopR1_3}`);
                                // await writeDataToCloud(element_2);
                                // console.log(`Successfully____ON${element_1.RELAYSTATE == "ON" && localStorage.getItem("R1") == 'true'}`);
                                // console.log(`Successfully____OFF${element_1.RELAYSTATE == "OFF" && localStorage.getItem("R1") == 'false'}`);
                                waitR1check = setTimeout(async () => {
                                    if (element_1.RELAYSTATE == "ON" && localStorage.getItem("R1") == 'true') {
                                        // let dd = new Date().getMilliseconds();
                                        let triggeronTime = new Date().toString().replace("GMT+0530 (India Standard Time)", "") + new Date().getMilliseconds();
                                        let Rpin = 29;
                                        let Relname = 'Relay_1';
                                        let Rid = 'R1';
                                        let RUser = element_1.USERNAME
                                        let RuserFrom = element_1.FROMALERTSTATE;
                                        let RuserTo = element_1.TOALERTSTATE;
                                        let Rgrafnew = element_2.newState;
                                        let Rgrafprev = element_2.prevState;
                                        let RcretedTime = new Date(element_2.created).toString();
                                        let RCom = element_1.RELAYSTATE;
                                        let RtimeDelay = element_1.TIMEDELAY == "0" ? 1000 : element_1.TIMEDELAY + "000";
                                        let PulseTime = element_1.PLUSEDURATION;
                                        await triggeronSwitch1.triggeron(Rpin, Relname, Rid, RUser, RCom, triggeronTime, RuserFrom, RuserTo, Rgrafnew, Rgrafprev, RcretedTime, RtimeDelay, PulseTime);
                                        await infSendtoDB.writeDataToCloud(element_2);
                                        console.log("successfully ON");
                                        element_1.PLUSEDURATION == "0" ? null : setTimeout(async () => { triggeronSwitch1.triggeroff(Rpin, Relname, Rid, RUser, RCom, triggeronTime, RuserFrom, RuserTo, Rgrafnew, Rgrafprev, RcretedTime, RtimeDelay, PulseTime)},PulseTime + "000");;
                                        tLoopR1_3 = true;
                                    } else if (element_1.RELAYSTATE == "OFF" && localStorage.getItem("R1") == 'false') {
                                        // let dd = new Date().getMilliseconds();                                        
                                        let triggeronTime = new Date().toString().replace("GMT+0530 (India Standard Time)", "") + new Date().getMilliseconds();
                                        let Rpin = 29;
                                        let Relname = 'Relay_1';
                                        let Rid = 'R1';
                                        let RUser = element_1.USERNAME;
                                        let RuserFrom = element_1.FROMALERTSTATE;
                                        let RuserTo = element_1.TOALERTSTATE;
                                        let Rgrafnew = element_2.newState;
                                        let Rgrafprev = element_2.prevState;
                                        let RcretedTime = new Date(element_2.created).toString();
                                        let RCom = element_1.RELAYSTATE;
                                        let RtimeDelay = element_1.TIMEDELAY == "0" ? 1000 : element_1.TIMEDELAY + "000";
                                        let PulseTime = element_1.PLUSEDURATION;
                                        await triggeronSwitch1.triggeroff(Rpin, Relname, Rid, RUser, RCom, triggeronTime, RuserFrom, RuserTo, Rgrafnew, Rgrafprev, RcretedTime, RtimeDelay, PulseTime);
                                        console.log("successfully OFF");
                                        element_1.PLUSEDURATION == "0" ? null : setTimeout(async () => { triggeronSwitch1.triggeron(Rpin, Relname, Rid, RUser, RCom, triggeronTime, RuserFrom, RuserTo, Rgrafnew, Rgrafprev, RcretedTime, RtimeDelay, PulseTime); }, PulseTime + "000");
                                        await infSendtoDB.writeDataToCloud(element_2);
                                        tLoopR1_3 = true;
                                    }
                                    else {
                                        console.log(`checkunsuccess`);
                                        await infSendtoDB.writeDataToCloud(element_2);
                                        tLoopR1_3 = true;
                                    }
                                }, element_1.TIMEDELAY == "0" ? 1700 : element_1.TIMEDELAY + "000");
                                // console.log(`TIME: ${setTR1}, ${element_1.TIMEDELAY + "000"}`);
                                // console.log(`lllFirst${tLoopR1_1}, Sec${tLoopR1_2}, Thir${tLoopR1_3}`);

                                // await sleep(setTR1);
                                // --------------------------------------------------------------------------------------------------------------------------------

// refactor code
// for (let i = 2; i <= 8; i++) {
//     const relay = "R" + i;
//     if (element_1[relay] == "off" || element_1[relay] == `off${relay}`) {
//       console.log(`No Dependent ${relay}`);
//     } else {
//       const localState = localStorage.getItem(relay);
//       if (element_1[relay] == `on${relay}` && localState == "false") {
//         console.log(`${relay} already on`);
//       } else if (element_1[relay] == `off${relay}` && localState == "true") {
//         console.log(`${relay} already off`);
//       } else {
//         clearTimeout(waitR1check);
//         tLoopR1_3 = true;
//         console.log(`${relay} State Mismatch`);
//         await infSendtoDB.writeDataToCloud(element_2);
//       }
//     }
//   }


                                //Dependent Relay_2 checking 
                                if (element_1.R2 == "offR2" && localStorage.getItem('R2') == "true") {
                                    console.log("Relay_2 already off");
                                } else if (element_1.R2 == "onR2" && localStorage.getItem('R2') == "false") {
                                    console.log("Relay_2 already on");
                                } else if (element_1.R2 == "off") {
                                    console.log("No Dependent Relay_2");
                                } else {
                                    clearTimeout(waitR1check);
                                    tLoopR1_3 = true;
                                    console.log("Relay_2 State Mismatch");
                                    await infSendtoDB.writeDataToCloud(element_2);
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
                                    clearTimeout(waitR1check);
                                    tLoopR1_3 = true;
                                    console.log("Relay_3 State Mismatch");
                                    await infSendtoDB.writeDataToCloud(element_2);
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
                                    clearTimeout(waitR1check);
                                    tLoopR1_3 = true;
                                    console.log("Relay_4 State Mismatch");
                                    await infSendtoDB.writeDataToCloud(element_2);
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
                                    clearTimeout(waitR1check);
                                    tLoopR1_3 = true;
                                    console.log("Relay_5 State Mismatch");
                                    await infSendtoDB.writeDataToCloud(element_2);
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
                                    clearTimeout(waitR1check);
                                    tLoopR1_3 = true;
                                    console.log("Relay_6 State Mismatch");
                                    await infSendtoDB.writeDataToCloud(element_2);
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
                                    clearTimeout(waitR1check);
                                    tLoopR1_3 = true;
                                    console.log("Relay_7 State Mismatch");
                                    await infSendtoDB.writeDataToCloud(element_2);
                                }

                                // --------------------------------------------------------------------------------------------------------------------------------
                                //Dependent Relay_8 checking 
                                if (element_1.R8 == "offR8" && localStorage.getItem('R8') == "true") {
                                    console.log("Relay_8 already off");
                                } else if (element_1.R8 == "onR8" && localStorage.getItem('R8') == "false") {
                                    console.log("Relay_8 already on");
                                } else if (element_1.R8 == "off") {
                                    console.log("No Dependent Relay_8");
                                } else {
                                    clearTimeout(waitR1check);
                                    tLoopR1_3 = true;
                                    console.log("Relay_8 State Mismatch");
                                    await infSendtoDB.writeDataToCloud(element_2);
                                }
                            } else {
                                console.log("Waiting function");
                            }
                        } else {
                            console.log(`Alert State Not Match${element_1.RELAYSTATE}`);
                            console.log(`mmm${element_1.FROMALERTSTATE}, ${element_2.prevState}, ${element_1.TOALERTSTATE}, ${element_2.newState}`);
                            await infSendtoDB.writeDataToCloud(element_2);
                            // tLoopR1_3 = true;
                            // clearTimeout(waitR1check);
                        }
                    }
                });
            }
        }
    }
    else {
        console.log(`No Relay_1: ${filterRelay1.length}`);
    }
}





//