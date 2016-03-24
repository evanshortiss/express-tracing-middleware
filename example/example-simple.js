'use strict';

var app = require('express')()
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

  // This will wrap the function in a light wrapper to time it, otherwise it
  // works just like you'd expect, args etc. are unchanged
  var timedSession = req.trace.tracify(verifySession);

  timedSession(function (err) {
    if (err) {
      next(err);
    } else {
      res.send('ok');
    }
  });
});


// You guessed it. Start listening on a port
app.listen(3000, function (err) {
  if (err) {
    throw err;
  }

  console.log('express app with tracing started on 3000');
});
