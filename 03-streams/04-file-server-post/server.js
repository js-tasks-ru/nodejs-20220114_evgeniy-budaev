const url = require('url');
const http = require('http');
const path = require('path');
const fs = require('fs');
const LimitSizeStream = require('./LimitSizeStream');
const LimitExceededError = require('./LimitExceededError');

const server = new http.Server();

server.on('request', (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname.slice(1);

  const filepath = path.join(__dirname, 'files', pathname);

  const throwError = (code) => {
    res.statusCode = code;
    res.end();
  };

  switch (req.method) {
    case 'POST':
      if (pathname.includes('/')) {
        return throwError(400);
      }

      if (fs.existsSync(filepath)) {
        return throwError(409);
      }

      const writeFileStream = fs.createWriteStream(filepath);
      const limitSizeStream = new LimitSizeStream({limit: 1e6});

      req
          .on('aborted', () => {
            fs.unlink(filepath, () => {});
          })
          .pipe(limitSizeStream)
          .on('error', (error) => {
            if (error instanceof LimitExceededError) {
              fs.unlink(filepath, () => throwError(413));
            }
          })
          .pipe(writeFileStream)
          .on('close', () => {
            res.statusCode = 201;
            res.end();
          });

      break;

    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

module.exports = server;
