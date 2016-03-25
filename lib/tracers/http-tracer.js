'use strict';

var request = require('request')
  , assert = require('assert')
  , VError = require('verror')
  , Tracer = require('../tracer')
  , util = require('util');

function HttpTracer (opts) {
  this.opts = opts;

  assert.equal(
    typeof opts,
    'object',
    'opts must be an object'
  );

  assert.equal(
    typeof opts.url,
    'string',
    'opts.url must be a string'
  );
}
util.inherits(HttpTracer, Tracer);
module.exports = HttpTracer;


HttpTracer.prototype.record = function (err, traceJson, callback) {
  var self = this;

  function onHttpTracerSend (err, body, res) {
    if (err) {
      callback(
        new VError(err, 'failed to send traces to %s', self.opts.url),
        null
      );
    } else if (res.statusCode !== 200) {
      callback(
        new VError(
          'failed to send traces to %s, non 200 status: %s %j',
          self.opts.url,
          res.statusCode,
          body
        ),
        null
      );
    } else {
      callback(null, null);
    }
  }

  request.post({
    path: '/trace',
    url: this.opts.url,
    timeout: this.opts.timeout || 15000,
    json: traceJson
  }, onHttpTracerSend);
};
