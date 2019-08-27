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

var Bitpanda = function (key, timeout, host) {
  this.key = key;
  this.timeout = timeout || 5000;
  this.host = host || 'api.exchange.bitpanda.com';
  this.private = false;
  _.bindAll(this);
}

Bitpanda.prototype._request = function (method, path, pdata, callback, args) {
  var timeout = this.timeout;
  data = undefined;
  var options = {
    host: this.host,
    path: path,
    method: method,
    headers: {}
  };
  if (this.key && this.private) {
    options.headers['Authorization'] = 'Bearer ' + this.key;
  }
  if (method === 'post') {
    options.headers['Content-Length'] = pdata.length;
    options.headers['content-type'] = 'application/json';
  }
  var req = https.request(options, function (res) {
    res.setEncoding('utf8');
    var buffer = '';
    res.on('data', function (data) {
      buffer += data;
    });
    res.on('end', function () {
      if (res.statusCode !== 200 && res.statusCode !== 204 && res.statusCode !== 201) {
        // console.log(buffer);
        var message;

        try {
          message = JSON.parse(buffer);
        } catch (e) {
          message = buffer;
        }

        return callback(new BitpandaError('Bitpanda error ' + res.statusCode, message));
      }
      if (res.statusCode === 204) {
        var json = JSON.parse('{"order_deleted":true}');
        return callback(json)
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
  if (method === 'post')
    req.write(pdata);
  req.end(data);
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

Bitpanda.prototype._delete = function (market, action, callback, args) {
  args = _.compactObject(args);

  if (market) {
    var path = '/public/v1/' + action + '/' + market;
  }
  else {
    var path = '/public/v1/' + action;
  }
  path += (querystring.stringify(args, null, null, { encodeURIComponent: querystring.unescape }) === '' ? '' : '?') + querystring.stringify(args, null, null, { encodeURIComponent: querystring.unescape });
  this._request('delete', path, undefined, callback, args)
}

Bitpanda.prototype._post = function (market, action, callback, args) {

  if (market)
    var path = '/public/v1/' + action + '/' + market;
  else
    var path = '/public/v1/' + action;

  // args = _.extend({
  //   key: this.key,
  //   signature: signature,
  //   nonce: nonce
  // }, args);

  // args = _.compactObject(args);
  // var data = querystring.stringify(args);

  var data = JSON.stringify(args);
  this._request('post', path, data, callback, args);
}

//
// Public API
//
/**
 * returns the Time in UTC from the Server into the callback function. 
 */
Bitpanda.prototype.time = function (callback) {
  this.private = false;
  this._get(null, 'time', callback);
}
/**
 * returns the Public fee structure into the callback function. 
 */
Bitpanda.prototype.fees = function (callback) {
  this.private = false;
  this._get(null, 'fees', callback);
}
/**
 * returns the list of available currencies into the callback function. 
 */
Bitpanda.prototype.currencies = function (callback) {
  this.private = false;
  this._get(null, 'currencies', callback);
}
/**
 * returns the list of available trade instruments into the callback function. 
 */
Bitpanda.prototype.instruments = function (callback) {
  this.private = false;
  this._get(null, 'instruments', callback);
}
/**
 * returns the order book for a given instrument(market) and compression level into the callback function. 
 */
Bitpanda.prototype.oderBook = function (market, level, callback) {
  this.private = false;
  options = level;
  this._get(market, 'order-book', callback, options);
}
/**
 * returns the candlesticks for a given instrument(market) for a closed time period into the callback function. 
 */
Bitpanda.prototype.candlesticks = function (market, options, callback) {
  this.private = false;
  this._get(market, 'candlesticks', callback, options);
}

//
// Privat API
//

/**
 * returns the balance details for an account into the callback function. 
 */
Bitpanda.prototype.getBalances = function (callback) {
  this.private = true;
  if (!this.key)
    return callback(new Error('Must provide key to make this API request.'));
  else
    this._get(null, 'account/balances', callback);
}
/**
 * returns the fee details for an account into the callback function. 
 */
Bitpanda.prototype.getAccountFees = function (callback) {
  this.private = true;
  if (!this.key)
    return callback(new Error('Must provide key to make this API request.'));
  else
    this._get(null, 'account/fees', callback);
}
/**
 * returns the Orders for an account into the callback function. 
 */
Bitpanda.prototype.getOrders = function (market, options, callback) {
  this.private = true;
  if (!this.key)
    return callback(new Error('Must provide key to make this API request.'));
  else
    if (market)
      options['instrument_code'] = market;

  this._get(null, 'account/orders', callback, options);
}
/**
 * returns the Order information defined by an orderId for an account into the callback function. 
 */
Bitpanda.prototype.getOrderByID = function (id, callback) {
  this.private = true;
  if (!this.key)
    return callback(new Error('Must provide key to make this API request.'));

  this._get(id, 'account/orders', callback);
}
/**
 * returns the trade information for a specific orderId into the callback function. 
 */
Bitpanda.prototype.getTradesByOrderID = function (id, callback) {
  this.private = true;
  if (!this.key)
    return callback(new Error('Must provide key to make this API request.'));

  this._get(id + '/trades', 'account/orders', callback);
}
/**
 * returns a paginated report on past trades, sorted by timestamp (newest first) into the callback function. 
 */
Bitpanda.prototype.getTrades = function (options, callback) {
  this.private = true;
  if (!this.key)
    return callback(new Error('Must provide key to make this API request.'));

  this._get(null, 'account/trades', callback, options);
}
/**
 * returns information for a trade into the callback function. 
 */
Bitpanda.prototype.getTradeByID = function (id, callback) {
  this.private = true;
  if (!this.key)
    return callback(new Error('Must provide key to make this API request.'));

  this._get(id, 'account/trades', callback);
}

/**
 * returns the running Traidingvolume for this account into the callback function.
 * It is calculated over a 30 day running window and updated once every 24hrs.
 */
Bitpanda.prototype.getTraidingVolume = function (callback) {
  this.private = true;
  if (!this.key)
    return callback(new Error('Must provide key to make this API request.'));

  this._get(null, 'account/trading-volume', callback);
}
/**
 * Create a new order of the type LIMIT, MARKET or STOP. There is a minimum size per order which can be looked up by querying the /instruments endpoint. Additionally, the precision limitations can be found there.
 */
Bitpanda.prototype.postOrder = function (request_body, callback) {
  this.private = true;
  if (!this.key)
    return callback(new Error('Must provide key to make this API request.'));

  this._post(null, 'account/orders', callback, request_body);
}
/**
 * Closes all Ordes or specify a Market to close all Orders from it.
 */
Bitpanda.prototype.deleteOrders = function (market, callback) {
  options = {}
  this.private = true;
  if (!this.key)
    return callback(new Error('Must provide key to make this API request.'));
  options['instrument_code'] = market;
  this._delete(null, 'account/orders', callback, options);
}
/**
 * Closes the Order by the specified ID and returns {"order_deleted":true} into the callback function if succesfull deleted.
 */
Bitpanda.prototype.deleteOrderByID = function (id, callback) {
  this.private = true;
  if (!this.key)
    return callback(new Error('Must provide key to make this API request.'));

  this._delete(id, 'account/orders', callback);
}
module.exports = Bitpanda;
