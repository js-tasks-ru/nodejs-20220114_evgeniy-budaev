const stream = require('stream');
const os = require('os');

class LineSplitStream extends stream.Transform {
  constructor(options) {
    super(options);
    this.str = '';
  }

  _transform(chunk, encoding, callback) {
    this.str += chunk;
    const strings = this.str.toString().split(os.EOL);

    if (strings.length > 0) {
      callback(null, strings.shift());
      strings.forEach((str) => this.push(str));
    } else {
      callback(null, null);
    }
  }

  _flush(callback) {
    callback(null, this.str);
  }
}

module.exports = LineSplitStream;
