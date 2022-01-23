const url = require('url');
const http = require('http');
const path = require('path');
const fs = require('fs');

const server = new http.Server();

server.on('request', (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname.slice(1);

  const filepath = path.join(__dirname, 'files', pathname);

  if(pathname.includes('/') || pathname.includes('..')){
    res.statusCode = 400;
    res.end('folders not allowed');
    return;
  }

  switch (req.method) {
    case 'GET':
        const ourStream =  fs.createReadStream(filepath);
        ourStream.pipe(res);
        ourStream.on('error', (err) => {
            if(err.code === 'ENOENT'){
                res.statusCode = 404;
                res.end('File not found');
                return;
            }
            res.statusCode = 500;
            res.end('Server error 500');
          })
      break;

    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

module.exports = server;
