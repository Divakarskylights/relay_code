const fs = require("fs");
var ModbusRTU = require("modbus-serial");
const request = require("request");
const influx = require("influx");
var Gpio = require("onoff").Gpio; //include onoff to interact with the GPIO
const localInfluxClient = new influx.InfluxDB("http://localhost:8086/");
var sModbusClient = new ModbusRTU();
const tcpp = require("tcp-ping");

var data = [];
var LED = new Gpio(4, "out");
var singleRegister = null;
var dataToPush = {};
let configuration = {};
var host;

// open connection to a serial port

async function sCreateInstance(c) {
  console.log(sModbusClient.isOpen);
  if (fs.existsSync("/dev/ttyUSB0")) {
    return new Promise(async function (resolve, reject) {
      try {
        await sModbusClient.connectRTUBuffered(
          "/dev/ttyUSB0",
          configuration.values[c].con,
        );
        sModbusClient.setTimeout(1000);
        console.log("instance created");
        resolve();
      } catch (error) {
        console.log(
          "Some error occured, trying to re-establish connection... Hang On !!!"
        );
        console.log(
          "******************+Error details start+******************"
        );
        console.log(error);
        console.log("******************+Error details end+******************");
        resolve();
        // createInstance();
      }
    });
  } else {
    console.log("check if port is loose or disconnected !");
    resolve();
  }
}

/*-------------------------------*/
/* Code for Elmeasure starts here*/
/*-------------------------------*/

async function ReadElmeasure(c) {
  let ct = 0;
  return new Promise(async function (resolve, reject) {
    sModbusClient.readHoldingRegisters(100, 124, async function (err, res) {
      if (res) {
        data = new Float32Array(new Uint16Array(res.data).buffer);
        console.log(data[0]);
        resolve();
      } else {
        //await sModbusClient.close();
        console.log("Err occured: " + JSON.stringify(err));
        console.log("Something is wrong with meter connection !");
        data = [];
        await sModbusClient.close();
        resolve();
      }
    });
  });
}

//Meter id1

async function writeDataToCloud1(data) {
  return new Promise(function (resolve, reject) {
    if (data != null && data.length > 0) {
      var date = new Date();
      localInfluxClient
        .writePoints(
          [
            {
              measurement: "Checking_New",
              tags: {
                hardware: "energy_meter",
              },
              fields: {
                Watts_Total: data[0],
                Watts_R_Phase: data[1],
                Watts_Y_Phase: data[2],
                Watts_B_Phase: data[3],

                VAR_Total: data[4],
                VAR_R_Phase: data[5],
                VAR_Y_Phase: data[6],
                VAR_B_Phase: data[7],

                PF_Ave_Inst: data[8],
                PF_R_Phase: data[9],
                PF_Y_Phase: data[10],
                PF_B_Phase: data[11],

                VA_Total: data[12],
                VA_R_Total: data[13],
                VA_Y_Total: data[14],
                VA_B_Total: data[15],

                VLL_Average: data[16],

                Vry_Phase: data[17],
                Vyb_Phase: data[18],
                Vbr_Phase: data[19],

                VLN_Avergae: data[20],

                V_R_Phase: data[21],
                V_Y_Phase: data[22],
                V_B_Phase: data[23],

                Current_Total: data[24],
                Current_R_Phase: data[25],
                Current_Y_Phase: data[26],
                Current_B_Phase: data[27],

                Frequency: data[28],

                Wh_Received: data[29],
                VAh_Received: data[30],
                VARh_Ind_Received: data[31],
                VARh_Cap_Received: data[32],

                Wh_Delivered: data[33],
                VAh_Delivered: data[34],
                VARh_Ind_Delivered: data[35],
                VARh_Cap_Delivered: data[36],

                PF_average_Received: data[37],
                Amps_average_Received: data[38],

                PF_average_Delivered: data[39],
                Amps_average_Delivered: data[40],

                Neutral_Current: data[41],

                Voltage_R_Harmonics: data[42],
                Voltage_Y_Harmonics: data[43],
                Voltage_B_Harmonics: data[44],

                Current_R_Harmonics: data[45],
                Current_Y_Harmonics: data[46],
                Current_B_Harmonics: data[47],
                Rising_Demand: data[48],
                Forecast_Demand: data[49],
                Maximum_Demand: data[50],
                Load_Hours_Received: data[51],
              },
              timestamp: date.getTime(),
            },
          ],
          {
            database: "staroffice",
            precision: "ms",
          }
        )
        .then(async () => {
          await sModbusClient.close();
          console.log(`---2---${host}Data inserted to DB !`);
          data = [];
          resolve();
        })
        .catch(async (error) => {
          await sModbusClient.close();
          console.log("Error saving data to InFlux: " + error);
          data = [];
          resolve();
        });
    } else {
      console.log("---2---Data is null hence nothing would be stored !");
      resolve();
    }
  });
}



var cnt = 0;
setInterval(async function () {
  try {
    if (cnt == 0)
      await updateConfig();
    for (var c = 0; c < configuration.values.length; c++) {
      if (configuration.values[c].meter_name == "id3") {
        await sCreateInstance(c);
        await sModbusClient.setID(configuration.values[c].meter_no);
        await ReadElmeasure(c);
        await writeDataToCloud1(data);
      }
    }
    cnt = cnt + 1;
  } catch (err) {
    console.log("Some error occured !", err);
  }
}, 1000);

async function updateConfig() {
  return new Promise(function (resolve, reject) {
    fs.readFile("./map.json", "utf8", (err, jsonString) => {
      if (err) {
        console.log("Error reading file:", err);
        resolve();
      }
      try {
        configuration = JSON.parse(jsonString);
        console.log("*****config updated!*****");
        // samp();
        resolve();
      } catch (err) {
        console.log("Error parsing JSON string:", err);
        resolve();
      }
    });
  });
}





/*
setInterval(async function () {
  try {
    await updateConfig();
  }
  catch (err) {
    console.log('Error while updating config file from AWS S3 !');
    console.log(err);
  }
}, 7000);
*/
