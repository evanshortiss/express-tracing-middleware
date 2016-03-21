'use strict';

var tracerStore = require('./lib/tracer-store')
  , xtend = require('xtend')
  , fhlog = require('fhlog')
  , assert = require('assert')
  , VError = require('verror');

fhlog.setDefault('level', fhlog.LEVELS.ERR);


/**
 * The fhlog instance this module uses
 * @type {Object}
 */
exports.fhlog = fhlog;


/**
 * A tracer constructor that can be used to send traces to a RHMAP instance
 *
 * e.g instance.tracers.add(new FHServiceTracer({
 * 		serviceId: '123456789asdfghjklqwerty'
 * }))
 *
 * @param  {Function}
 * @return {FHServiceTracer}
 */
exports.FHServiceTracer = require('./lib/tracers/fh-service-tracer');


/**
 * A tracer constructor that can be used to log traces to stdout
 *
 * e.g instance.store.add(new LogTracer())
 *
 * @param  {Function}
 * @return {FHServiceTracer}
 */
exports.LogTracer = require('./lib/tracers/log-tracer');


/**
 * Returns a tracing instance with a middleware function attaced.
 * Opts passed should be an object that can include:
 *
 * {
 * 		appId: <String>
 *
 * 		Identifier we use to associate traces with this app so the reporter
 * 		can associate a name with traces
 *
 *
 * 		sanatizeUrl: <Function>
 *
 * 		We pass the URL of each trace to the tracers. This function can be
 * 		used to make changes to the url if desired. This will recieve a
 * 		String parameter and should return a String.
 *
 *
 * 		sanatizeHeaders: <Function>
 *
 * 		Same as sanatizeUrl, but uses an Object instead of a String
 * }
 *
 * @return {Object}
 */
exports.getInstance = function (opts) {

  assert.equal(
    typeof opts,
    'object',
    'an options object must be passed into get instance'
  );

  assert.equal(
    typeof opts.appId,
    'string',
    'an "appId" string must be passed in options'
  );


  // Tracers for this middleware instance
  var tracers = tracerStore(opts);


  /**
   * The tracer instance we're going to return to the callee
   * @type {Object}
   */
  var ret = {
    tracers: tracers,
    events: require('./lib/trace-events')
  };


  /**
   * Primary functionality, binds the "trace" Object to every request
   * @param {IncomingRequest}
   * @param {OutgingResponse}
   * @param {Function}
   * @return {undefined}
   */
  ret.middleware = function (req, res, next) {
    // TODO: should probably emit an err and still process the request
    try {
      req.trace = tracers.createTrace(req, res);

      // Ensure next is called outside of this stack to ensure stack traces
      // dont appear to point to this middleware as the cause of an error
      process.nextTick(next);
    } catch(e) {
      return next(new VError(e, 'failed to bind trace to request'));
    }
  };

  return ret;
};
