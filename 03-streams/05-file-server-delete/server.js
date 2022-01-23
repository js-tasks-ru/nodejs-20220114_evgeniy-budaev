const url = require('url');
const http = require('http');
const path = require('path');
const fs = require('fs');

const server = new http.Server();

server.on('request', (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname.slice(1);

  const filepath = path.join(__dirname, 'files', pathname);
  const throwError = (code) => {
    res.statusCode = code;
    res.end();
  };

  if (pathname.includes('/')) {
    return throwError(400);
  }

  if (!fs.existsSync(filepath)) {
    return throwError(404);
  }

  switch (req.method) {
    case 'DELETE':
      fs.unlink(filepath, () => {
        res.end();
      });

      break;

    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

module.exports = server;
