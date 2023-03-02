const influx = require('influx');
const localInfluxClient = new influx.InfluxDB('http://localhost:8086/staroffice');

module.exports.writeDataToCloud =writeDataToCloud;

async function writeDataToCloud(infData) {
    return new Promise(function (resolve, reject) {
        if (infData.alertId > 0) {
            localInfluxClient.writePoints([
                {
                    measurement: 'alertApi',
                    tags: {
                        hardware: "API",
                    },
                    fields: {
                        id: infData.id,
                        alertId: infData.alertId,
                        panelName: infData.text.slice(0, 25),
                        panelId: infData.panelId,
                        newState: infData.newState,
                        prevState: infData.prevState,
                        created: infData.created,
                        lastEnd: infData.timeEnd,
                    },
                    timestamp: infData.created,
                }],
                {
                    database: 'staroffice',
                    precision: 'ms',
                })
                .then(async () => {
                    console.log('Data inserted to cloud elm !');
                    data = []
                    resolve();
                })
                .catch(async error => {
                    console.log('Error saving data to InFlux: ' + error);
                    data = []
                    resolve();
                });
        }
        else {
            console.log('Data is null hence nothing would be stored !');
            resolve();
        }
    });
}