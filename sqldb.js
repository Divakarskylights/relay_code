// const mariadb = require('mariadb');
// const pool = mariadb.createPool({
//   host: 'localhost', 
//   user: 'root',
//   database: 'skydb',
//   password: 'sky1234',
//   connectionLimit: 5
// });
// pool.getConnection()
//  .then(conn => {
//    conn.query("INSERT INTO history (USERNAME, RELAY, VAL, DATETIME, CAUSE) VALUES ('DIVAKAR', '1', 'ON', '2012-12-05', 'Schedule');")
//      .then((rows) => {
//        console.log(rows); 
//      })
//      // .then((res) => {
//      //   // console.log(res); 
//      //   conn.end();
//      // })
//      .catch(err => {

//        console.log(err); 
//        conn.end();
//      })

//  }).catch(err => {
//      console.log(`HH${err}`);
//    //not connected
//  });

//  poo

const mariadb = require('mariadb');
const express = require('express');
const app = express();


const pool = mariadb.createPool({
  host: 'localhost',
  user: 'root',
  database: 'skydb',
  password: 'sky1234',
  connectionLimit: 5
});

app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With');
  next();
});


// Send the data using the GET method
app.get('/getprojectdata', async (req, res) => {
  try {
    // Get a connection from the connection pool
    const conn = await pool.getConnection();
    // Execute the SQL query
    const rows = await conn.query("SELECT * FROM projects ORDER BY ID");
    // Release the connection back to the pool
    conn.release();
    res.setHeader('Access-Control-Allow-Origin', '*');
    // Send the data as a JSON response
    res.json(rows);

  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});





app.get('/getAlertStates', (req, res) => {
  pool.getConnection()
    .then(conn => {
      conn.query('SELECT * FROM stateRelayonoff ORDER BY ID DESC')
        .then((rows) => {
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.json(rows);
          conn.release();
        })
        .catch(err => {
          console.log(err);
          conn.release();
          res.status(500).json(err);
        })
    }).catch(err => {
      console.log(err);
      res.status(500).json(err);
    })
});


app.get('/getoffData', (req, res) => {
  pool.getConnection()
    .then(conn => {
      conn.query('SELECT * FROM Sampoff ORDER BY ID DESC')
        .then(rows => {
          conn.release();
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.json(rows);
        })
        .catch(err => {
          conn.release();
          console.log(err);
          res.sendStatus(500);
        });
    })
    .catch(err => {
      console.log(err);
      res.sendStatus(500);
    });
});


app.get('/getonData', (req, res) => {
  pool.getConnection()
    .then(conn => {
      conn.query('SELECT * FROM samp ORDER BY ID DESC')
        .then(rows => {
          conn.release();
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.json(rows);
        })
        .catch(err => {
          conn.release();
          console.log(err);
          res.sendStatus(500);
        });
    })
    .catch(err => {
      console.log(err);
      res.sendStatus(500);
    });
});

app.get('/getonoffData', (req, res) => {
  pool.getConnection()
    .then(conn => {
      conn.query('SELECT * FROM `onoff` WHERE TIMESTAMP(DATETIME) ORDER BY DATETIME DESC')
        .then(rows => {
          conn.release();
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.json(rows);
        })
        .catch(err => {
          conn.release();
          console.log(err);
          res.sendStatus(500);
        });
    })
    .catch(err => {
      console.log(err);
      res.sendStatus(500);
    });
});


app.post('/offDatesch', function (req, res) {
  const { offval, DateandTime, offTime, Username, Relay, datetime, days } = req.body;
  if (Username !== '' && offTime !== '') {
    const sql = `INSERT INTO Sampoff (USERNAME, RELAY, OFFVAL, OFFDATE, OFFTIME, DATETIME, DAYS) VALUES ('${Username}', '${Relay}', '${offval}', '${DateandTime}', '${offTime}', '${datetime}', '${days}');`;
    pool.getConnection().then(conn => {
      conn.query(sql, (err, result) => {
        if (err) {
          console.log(err);
          res.send('false');
        } else {
          console.log(result);
          res.send('true');
        }
      });
    })

  } else {
    res.send('Null Value');
  }
});


app.post('/onDatesch', function (req, res) {
  const { onval, DateandTime, onTime, Username, Relay, datetime, days } = req.body;
  if (Username !== '' && offTime !== '') {
    const sql = `INSERT INTO samp (USERNAME, RELAY, ONVAL, ONDATE, OFFTIME, DATETIME, DAYS) VALUES ('${Username}', '${Relay}', '${onval}', '${DateandTime}', '${onTime}', '${datetime}', '${days}');`;
    pool.getConnection().then(conn => {
      conn.query(sql, (err, result) => {
        if (err) {
          console.log(err);
          res.send('false');
        } else {
          console.log(result);
          res.send('true');
        }
      });
    })

  } else {
    res.send('Null Value');
  }
});

app.post('/onoffDatesch', function(req, res) {
  const { val, Username, Relay, datetime, days } = req.body;
  if (Username !== '' && datetime !== '') {
    const sql = `INSERT INTO onoff (USERNAME, RELAY, VAL, DATETIME, DAYS) VALUES ('${Username}', '${Relay}', '${val}', '${datetime}', '${days}');`;
    pool.getConnection().then(conn => {
      conn.query
    (sql, (err, result) => {
      if (err) {
        console.log(err);
        res.send('false');
      } else {
        console.log(result);
        res.send('true');
      }
    }); });
  } else {
    res.send('Null Value');
  }
});


app.post('/stateAlertData', function(req, res) {
  const { idDB, panelAlertNameDB, aidDB, username, panelidDB, relayNumDB, relayonoffDB, lastAlerttimeDB, newAlertStateDB, prevAlertStateDB, fromAlertStateDB, toAlertStateDB, r1, r2, r3, r4, r5, r6, r7, r8, relayTimeDelay, relayPulseDuration } = req.body;
  if (username !== '' && panelAlertNameDB !== '') {
    const sql = `INSERT INTO stateRelayonoff (USERNAME, APIID, PANELALERTNAME, RELAYNUM, RELAYSTATE, alertId, panelId, LASTALERTTIME, NEWALERTSTATE, PREVALERTSTATE, FROMALERTSTATE, TOALERTSTATE, R1, R2, R3, R4, R5, R6, R7, R8, TIMEDELAY, PLUSEDURATION) VALUES ('${username}', '${idDB}', '${panelAlertNameDB}', '${relayNumDB}', '${relayonoffDB}', '${aidDB}', '${panelidDB}', '${lastAlerttimeDB}', '${newAlertStateDB}', '${prevAlertStateDB}', '${fromAlertStateDB}', '${toAlertStateDB}', '${r1}', '${r2}', '${r3}', '${r4}', '${r5}', '${r6}', '${r7}', '${r8}', '${relayTimeDelay}', '${relayPulseDuration}');`;
    pool.getConnection().then(conn => {
      conn.query(sql, (err, result) => {
      if (err) {
        console.log(err);
        res.send('false');
      } else {
        console.log(result);
        res.send('true');
      }
    })});
  } else {
    res.send('Null Value');
  }
});


app.post('/deleteAlertStates', function(req, res) {
  const { id } = req.body;
  if (id !== '') {
    const sql = `DELETE FROM stateRelayonoff WHERE ID = '${id}';`;
    pool.getConnection().then(conn => {
      conn.query(sql, (err, result) => {
      if (err) {
        console.log(err);
        res.send('false');
      } else {
        console.log(result);
        res.send('true');
      }
    })});
  } else {
    res.send('Null Value');
  }
});

app.post('/deleteData', function(req, res) {
  const { id } = req.body;
  if (id !== '') {
    const sql = `DELETE FROM onoff WHERE ID = '${id}';`;
    pool.getConnection().then(conn => {
      conn.query(sql, (err, result) => {
      if (err) {
        console.log(err);
        res.send('false');
      } else {
        console.log(result);
        res.send('true');
      }
    })});
  } else {
    res.send('Null Value');
  }
});



const PORT = 3333;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
