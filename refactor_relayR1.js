async function getStateAlerts(getFil, Resp) {
const filterRelay1 = relay1.filter((item) => item.RELAYSTATE === true);

if (filterRelay1.length > 0) {
  for (const element1 of filterRelay1) {
    console.log(`UserApiR1${JSON.stringify(element1)}`);

    const getapiidataR1 = getFil.filter((item) => item.alertId === element1.alertId);

    for (const element2 of getapiidataR1) {
      console.log(`grafApiR1${JSON.stringify(element2.id)}`);

      localInfluxClient.query('SELECT * FROM alertApi').then(async (items) => {
        const aa = items.filter((e) => e.id === element2.id);

        if (aa.length > 0) {
          console.log("_________________________");
          console.log(`Relay _1 Id's Found${element1.RELAYSTATE}`);
          console.log(element2.created);

          const dd = new Date().getMilliseconds();
          const triggeronTime = new Date().toString().replace("GMT+0530 (India Standard Time)", "") + dd;
          console.log(triggeronTime);

          console.log(`USER_FROMSTATE: ${element1.FROMALERTSTATE}, USER_FROMSTATE: ${element1.TOALERTSTATE}, Graf Prev: ${element2.prevState}, Graf new: ${element2.newState}`);
        } else {
          console.log(`Relay _1 id's Not Found${element1.RELAYSTATE}`);
          console.log(`USER_FROMSTATE: ${element1.FROMALERTSTATE}, USER_FROMSTATE: ${element1.TOALERTSTATE}, Graf Prev: ${element2.prevState}, Graf new: ${element2.newState}`);
        }
      });
    }
  }
}
}




for (let i = 2; i <= 8; i++) {
  const relay = "R" + i;
  if (element_1[relay] == "off" || element_1[relay] == `off${relay}`) {
    console.log(`No Dependent ${relay}`);
  } else {
    const localState = localStorage.getItem(relay);
    if (element_1[relay] == `on${relay}` && localState == "false") {
      console.log(`${relay} already on`);
    } else if (element_1[relay] == `off${relay}` && localState == "true") {
      console.log(`${relay} already off`);
    } else {
      clearTimeout(waitR1check);
      tLoopR1_3 = true;
      console.log(`${relay} State Mismatch`);
      await infSendtoDB.writeDataToCloud(element_2);
    }
  }
}
