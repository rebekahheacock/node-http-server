'use strict';

const http = require('http');
const url = require('url');

const server = http.createServer((request, response) => {
  let start = process.hrtime();
  new Promise((resolve, reject) => {
    let body = '';
    // using a Promise lets us isolate all event listeners in a single place
    // compare to non-promise version
    request.on('error', (error) => {
      reject(error);
    });
    request.on('data', (chunk) => {
      body += chunk;
    });
    request.on('end', () => {
      resolve(body);
    });
  }).then((data) => {
    // actually process request. could turn this into separate function
    let parsedUrl = url.parse(request.url, true);
    let keys = Object.keys(parsedUrl);
    keys.forEach((key) => {
      if (parsedUrl[key] === null) {
        delete parsedUrl[key];
      }
    });
    return {
      httpVersion: request.httpVersion,
      method: request.method,
      parsedUrl,
      headers: request.headers,
      data,
    };
  }).then(JSON.stringify).then((json) => {
    // create and write response. could turn into separate function
    response.writeHead(200, 'OK', {
      'Content-Length': json.length,
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': ['OPTIONS', 'POST', 'GET', 'PATCH', 'DELETE'],
    });
    response.write(json);
    response.end();
  }).catch(console.error).then(() => {
    // this will get logged regardless of whether we have success or failure
    // can put "then" after "catch" (kind of like a "finally" in a try/catch)
    let elapsed = process.hrtime(start);
    console.log(`Request processed in ${elapsed[0] * 1e9 + elapsed[1]} nanoseconds`);
  });
});

server.on('listening', () => {
  console.log('echo server listening');
});

server.listen(3000);
