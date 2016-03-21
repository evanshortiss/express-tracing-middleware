'use strict';

var span = require('./span')
  , events = require('./trace-events').events
  , spanStore = require('./span-store')
  , onFinished = require('on-finished');


module.exports = function (opts) {

  var trace = {}
    , store = spanStore(opts);


  // Record the server receive event for this trace
  store.spans.push(
    span({
      name: events.SERVER_RECEIVE,
      initEvent: events.SERVER_RECEIVE,
      autostart: false
    })
  );

  /**
   * Create a span that can be used to track time taken by operations
   * @param  {Object} opts
   * @return {Object}
   */
  trace.createSpan = function (opts) {
    var s = span(opts);

    store.spans.push(s);

    return s;
  };


  /**
   * Wraps an asynchronous function so that it is timed for this trace
   * @param  {Function} fn
   * @return {Function}
   */
  trace.tracify = function (fn, name) {
    return function _tracified () {
      var args = Array.prototype.slice.call(arguments)
        , callback = args.splice(args.length - 1, 1)[0]
        , s = trace.createSpan({
          name: name || fn.name
        });

      function onComplete () {
        // Signal the end of the span and fire the "true" callback
        s.end();
        callback.apply(callback, Array.prototype.slice.call(arguments));
      }

      // Call the original function with given args and our new callback
      fn.apply(fn, args.concat([onComplete]));
    };
  };


  /**
   * Ends a trace by recording SERVER_SEND if applicable and record the trace
   * with all configured tracers
   *
   * This shouldn't be called directly unless you're certain it's ok to do so
   *
   * @param  {[type]} err [description]
   * @return {[type]}     [description]
   */
  trace._end = function (err) {
    // Create our server send event
    store.spans.push(
      span({
        name: events.SERVER_SEND,
        initEvent: events.SERVER_SEND,
        autostart: false
      })
    );

    store.writeToTracers(err);
  };


  // Once the response has been streamed to the client record the trace
  onFinished(opts.res, trace._end);

  return trace;
};
