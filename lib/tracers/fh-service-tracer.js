'use strict';

var assert = require('assert')
  , VError = require('verror')
  , Tracer = require('../tracer')
  , util = require('util');

function FHServiceTracer (opts) {
  this.opts = opts;

  assert.equal(
    typeof opts,
    'object',
    'opts must be an object'
  );

  assert.equal(
    typeof opts.fh,
    'object',
    'opts.fh must be provided. e.g opts.fh = require("fh-mbaas-api")'
  );

  assert.equal(
    typeof opts.guid,
    'string',
    'opts.guid must be a valid 24 character cloud/service id String'
  );

  assert.equal(
    opts.guid.length,
    24,
    'opts.guid must be a valid 24 character cloud/service id String'
  );
}
util.inherits(FHServiceTracer, Tracer);
module.exports = FHServiceTracer;


FHServiceTracer.prototype.record = function (err, traceJson, callback) {
  var self = this;

  function onFHServiceTracerSend (err, body, res) {
    if (err) {
      callback(
        new VError(err, 'failed to send traces to %s', self.opts.guid),
        null
      );
    } else if (res.statusCode !== 200) {
      callback(
        new VError(
          'failed to send traces to %s, non 200 status: %s %j',
          self.opts.guid,
          res.statusCode,
          body
        ),
        null
      );
    } else {
      callback(null, null);
    }
  }

  this.opts.fh.service({
    method: 'POST',
    path: '/traces',
    guid: this.opts.guid,
    timeout: this.opts.timeout || 15000,
    params: traceJson
  }, onFHServiceTracerSend);
};
