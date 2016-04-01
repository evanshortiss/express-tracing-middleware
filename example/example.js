'use strict';

var app = require('express')()
  , util = require('./util')
  , async = require('async')
  , getJson = require('./get-json')
  , tracing = require('../index.js')
  , verifySession = require('./session.js');


/**
 * Creates an instance of our awesome tracing middleware.
 * We'll use this to trace requests coming into our express application.
 */
var mw = tracing.getInstance({
  appId: '123456789012345678901212'
});


/**
 * Add domains to incoming requests so we can peform error handling and
 * access request variables without needing to pass the req object around.
 *
 * This is completely optional, and domains are deprecated, but no replacement
 * has been determined yet so we use them here. If you don't want to do this
 * it's fine, just pass req.trace to functions that need it.
 *
 * See get-json.js for an example of how we can access the active domain for
 * a request and use "members" attached to it.
 */
app.use(require('express-domain-middleware'));


/**
 * mw.tracers is a store that can have many tracing "streams" added.
 * If you wanted you could write a HTTP/Mongo/Redis stream, let your
 * imagination run wild...
 *
 * Here we add a bundled tracer that will print our traces to stdout, pretty
 * useful for quick debugging
 */
mw.tracers.add(
  new tracing.LogTracer({
    maxNameLength: 14, // Truncate any span details longer than 14 chars
  })
);


/**
 * Now that we've finished configuring the tracing instance, let's attach it
 * to our express application so it actually does its job.
 */
app.use(mw.middleware);


/**
 * Create a GET request handler that runs after a small delay (faking latency).
 */
app.get('/*', function (req, res, next) {
  util.runAfterDelay(function () {
    processRequest(req, res, next);
  }, 1000);
});


// You guessed it. Start listening on a port
app.listen(3000, function (err) {
  if (err) {
    throw err;
  }

  console.log('express app with tracing started on 3000');
});


/**
 * We process all requests using this generic handler.
 * @param  {IncomingRequest}    req
 * @param  {OutgoingResponse}   res
 * @param  {Function} next
 */
function processRequest (req, res, next) {
  async.waterfall([
    // Wrap asynchronous functions so that they're automatically timed for us
    req.trace.tracify(verifySession),

    // This is timed internally
    getJson
  ], function onRequestProcessed (err, json) {
    if (err) {
      next(err);
    } else {
      res.json(json);
    }
  });
}
