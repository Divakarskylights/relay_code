// var days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
// var db = 'Mon, Wed, Fri, Sat';
// var dayName = days[new Date().getDay()];
// var ff = db.split(', '); 
// var hel = ff.includes(dayName)

const http = require('http');

const server = http.createServer((req, res) => {
  const options = {
    hostname: 'localhost', // the IP address or hostname of the target server
    port: 8086, // the port number of the target server
    path: req.url, // the requested URL path
    method: req.method, // the requested HTTP method
    headers: req.headers // the requested headers
  };

  const proxyReq = http.request(options, proxyRes => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });

  req.pipe(proxyReq);
});

server.listen(8560, () => {
  console.log('Port forwarding server running on port 8560');
});