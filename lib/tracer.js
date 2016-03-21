'use strict';

var VError = require('verror');

/**
 * Service Tracer that writes logs over HTTP to an mBaaS Service
 * @param  {String} serviceId
 */
function Tracer () {}
module.exports = Tracer;

/**
 * Record must be defined on the Tracer instance
 * @param  {Object}     traceObj
 * @param  {Function}   callback
 */
Tracer.prototype.record = function(/* traceObj, callback */) {
  throw new VError(
    '"record" method not implemented for %s',
    this.constructor.name
  );
};
