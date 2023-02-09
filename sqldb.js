const mariadb = require('mariadb');
const pool = mariadb.createPool({
  host: 'localhost', 
  user: 'root',
  database: 'skydb',
  password: 'sky1234',
  connectionLimit: 5
});
pool.getConnection()
 .then(conn => {
   conn.query("INSERT INTO history (USERNAME, RELAY, VAL, DATETIME, CAUSE) VALUES ('DIVAKAR', '1', 'ON', '2012-12-05', 'Schedule');")
     .then((rows) => {
       console.log(rows); 
     })
     // .then((res) => {
     //   // console.log(res); 
     //   conn.end();
     // })
     .catch(err => {
      
       console.log(err); 
       conn.end();
     })
     
 }).catch(err => {
     console.log(`HH${err}`);
   //not connected
 });