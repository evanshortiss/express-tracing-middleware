'use strict';

var Tracer = require('../tracer')
  , xtend = require('xtend')
  , util = require('util');

var defaults = {
  maxNameLength: 15,
  logRaw: false
};

function LogTracer (opts) {
  this.opts = xtend(defaults, opts || {});
}
util.inherits(LogTracer, Tracer);
module.exports = LogTracer;


LogTracer.prototype.record = function (err, trace, callback) {
  var self = this;

  console.log('\n====== Trace Start ======');

  if (this.opts.logRaw) {
    console.log(JSON.stringify(trace, null, 2));
  } else {
    console.log('%s: %s\n', trace.method, trace.url);
    trace.spans.forEach(function (spans) {
      spans.forEach(function (s) {
        console.log(
          '[%s] - %s - %s - %s',
          new Date(s.ts).toJSON(),
          truncate(s.type, 10),
          truncate(s.name, self.opts.maxNameLength),
          truncate(s.detail, self.opts.maxNameLength)
        );
      });
    });
  }

  console.log('====== Trace End ======');

  callback(null, null);
};

function truncate (str, maxLen) {
  if (str.length > maxLen) {
    return str.substr(0, maxLen - 3).concat('...');
  } else {
    return pad(str, maxLen);
  }
}

function pad (str, len) {
  return str
    .split('')
    .concat(new Array(len - (str.length - 1)).join(' '))
    .join('');
}
