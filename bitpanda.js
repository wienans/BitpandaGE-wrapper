var querystring = require("querystring");
var https = require('https');
var _ = require('underscore');
// var crypto = require('crypto');

_.mixin({
  // compact for objects
  compactObject: function (to_clean) {
    _.map(to_clean, function (value, key, to_clean) {
      if (value === undefined)
        delete to_clean[key];
    });
    return to_clean;
  }
});

// error object this lib returns
var BitpandaError = function BitpandaError(message, meta) {
  Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  this.message = message;
  this.meta = meta;
};

var Bitpanda = function (key, secret, client_id, timeout, host) {
  this.key = key;
  this.timeout = timeout || 5000;
  this.host = host || 'api.exchange.bitpanda.com';

  // Unused
  this.secret = secret;
  this.client_id = client_id;

  _.bindAll(this);
}

Bitpanda.prototype._request = function (method, path, data, callback, args) {
  var timeout = this.timeout;
  var options = {
    host: this.host,
    path: path,
    method: method
    // headers: {
    //   'User-Agent': 'Mozilla/4.0 (compatible; Bitstamp node.js client)'
    // }
  };

  if (method === 'post') {
    options.headers['Content-Length'] = data.length;
    options.headers['content-type'] = 'application/x-www-form-urlencoded';
  }

  var req = https.request(options, function (res) {
    res.setEncoding('utf8');
    var buffer = '';
    res.on('data', function (data) {
      buffer += data;
    });
    res.on('end', function () {
      if (res.statusCode !== 200) {
        console.log(buffer);
        var message;

        try {
          message = JSON.parse(buffer);
        } catch (e) {
          message = buffer;
        }

        return callback(new BitpandaError('Bitpanda error ' + res.statusCode, message));
      }
      try {
        var json = JSON.parse(buffer);
      } catch (err) {
        return callback(err);
      }
      // console.log(buffer);
      // callback(null, json);
      callback(json);
    });
  });

  req.on('error', function (err) {
    callback(err);
  });

  req.on('socket', function (socket) {
    socket.setTimeout(timeout);
    socket.on('timeout', function () {
      req.abort();
    });
  });

  req.end(data);
}

// if you call new Date too fast it will generate
// the same ms, helper to make sure the nonce is
// truly unique (supports up to 999 calls per ms).
Bitpanda.prototype._generateNonce = function () {
  var now = new Date().getTime();

  if (now !== this.last)
    this.nonceIncr = -1;

  this.last = now;
  this.nonceIncr++;

  // add padding to nonce incr
  // @link https://stackoverflow.com/questions/6823592/numbers-in-the-form-of-001
  var padding =
    this.nonceIncr < 10 ? '000' :
      this.nonceIncr < 100 ? '00' :
        this.nonceIncr < 1000 ? '0' : '';
  return now + padding + this.nonceIncr;
}

Bitpanda.prototype._get = function (market, action, callback, args) {
  args = _.compactObject(args);

  if (market) {
    var path = '/public/v1/' + action + '/' + market;
  }
  else {
    var path = '/public/v1/' + action;
  }
  path += (querystring.stringify(args, null, null, { encodeURIComponent: querystring.unescape }) === '' ? '' : '?') + querystring.stringify(args, null, null, { encodeURIComponent: querystring.unescape });
  this._request('get', path, undefined, callback, args)
}


Bitpanda.prototype._post = function (market, action, callback, args) {
  if (!this.key)
    return callback(new Error('Need Auth Key for API'));

  if (market)
    var path = '/public/v1/' + action + '/' + market;
  else
    var path = '/public/v1/' + action;

  // var nonce = this._generateNonce();
  // var message = nonce + this.client_id + this.key;
  // var signer = crypto.createHmac('sha256', new Buffer(this.secret, 'utf8'));
  // var signature = signer.update(message).digest('hex').toUpperCase();

  // args = _.extend({
  //   key: this.key,
  //   signature: signature,
  //   nonce: nonce
  // }, args);

  // args = _.compactObject(args);
  // var data = querystring.stringify(args);

  this._request('post', path, data, callback, args);
}

//
// Public API
//
Bitpanda.prototype.time = function (callback) {
  this._get(null, 'time', callback);
}

Bitpanda.prototype.fees = function (callback) {
  this._get(null, 'fees', callback);
}

Bitpanda.prototype.currencies = function (callback) {
  this._get(null, 'currencies', callback);
}

Bitpanda.prototype.instruments = function (callback) {
  this._get(null, 'instruments', callback);
}

Bitpanda.prototype.oderBook = function (market, level, callback) {
  options = level;
  this._get(market, 'order-book', callback, options);
}

Bitpanda.prototype.candlesticks = function (market, options, callback) {
  this._get(market, 'candlesticks', callback, options);
}

module.exports = Bitpanda;
