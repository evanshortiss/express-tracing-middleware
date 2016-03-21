'use strict';

var app = require('express')()
  , async = require('async')
  , tracing = require('../index.js');

// Let's get a middleware instance to use
var mw = tracing.getInstance({
  appId: '123456789012345678901212'
});

// Add a logger that prints our traces to stdout
mw.tracers.add(new tracing.LogTracer({
  maxNameLength: 14, // Truncate any span details longer than 14 chars


  // logRaw: true // Set logRaw to true to print the JSON for the trace
}));

// Have the express app track every request
app.use(mw.middleware);

// Create a GET request and wrap each function in a tracer
app.get('/*', function (req, res, next) {

  // Create a span manually
  var delaySpan = req.trace.createSpan({
    name: '1000ms-delay'
  });

  setTimeout(function () {
    delaySpan.record('25%');
  }, 250);
  setTimeout(function () {
    delaySpan.record('50%');
  }, 500);
  setTimeout(function () {
    delaySpan.record('75%');
  }, 750);

  // Adding a deliberate 1 second delay to the request
  setTimeout(function () {
    delaySpan.end(); // End our delay span

    async.waterfall([
      // Wrap asynchronous functions so that they're automatically timed for us
      req.trace.tracify(validateSession),
      req.trace.tracify(getJson)
    ], function onRequestProcessed (err, json) {
      if (err) {
        next(err);
      } else {
        res.json(json);
      }
    });
  }, 1000);
});

app.listen(3000, function (err) {
  if (err) {
    throw err;
  }

  console.log('express app with tracing started on 3000');
});


// Mimics performing i/o to validate a user session
function validateSession (callback) {
  setTimeout(function () {
    callback(null);
  }, getRandomDelay());
}

// Mimics performing i/o to load JSON
function getJson (callback) {
  setTimeout(function () {
    callback(null, {
      a: '0',
      b: '1',
      c: '2'
    });
  }, getRandomDelay());
}

// Returns a random delay time between 0 and 3 seconds
function getRandomDelay () {
  return Math.floor(Math.random() * 2000);
}
