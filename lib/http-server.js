'use strict';

const http = require('http');
const url = require('url');

const server = http.createServer((request, response) => {
  // start a timer
  let start = process.hrtime();
  // create a pojo, and use request object to fill out pojo
  // node creates request object based on request it receives
  // incoming request (a string) is parsed into an object (http incoming message)
  let echo = {};
  echo.httpVersion = request.httpVersion;
  echo.method = request.method;
  // parse URL to escape unfriendly characters and break into path, pathname, search, query params, etc.
  echo.url = url.parse(request.url, true);
  let keys = Object.keys(echo.url);
  keys.forEach((key) => {
    if (echo.url[key] === null) {
      delete echo.url[key];
    }
  });
  echo.headers = request.headers;
  // assemble data from request, as it comes in (in chunks)
  // node does this piecemeal; Ruby waits for the whole thing first
  echo.data = '';
  request.on('data', (chunk) => {
    echo.data += chunk;
  });
  request.on('end', () => {
    let echoJSON = JSON.stringify(echo);
    response.writeHead(200, 'OK', {
      'Content-Length': echoJSON.length,
      'Content-Type': 'application/json',
    });
    response.write(echoJSON);
    response.end();
    let elapsed = process.hrtime(start);
    console.log(`Request processed in ${elapsed[0] * 1e9 + elapsed[1]} nanoseconds`);
  });
});

server.on('listening', () => {
  console.log('echo server listening');
});

// start the server listening on port 3000
server.listen(3000);
