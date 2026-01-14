
const http = require('http');

const options = {
    hostname: '127.0.0.1',
    port: 54321,
    path: '/auth/v1/health',
    method: 'GET',
    timeout: 2000
};

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    res.on('data', (chunk) => { console.log(`BODY: ${chunk}`); });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
    process.exit(1);
});

req.end();
