'use strict';

var tracing = require('../index.js');

/**
 * Generates a random delay in 0-2 second range
 * @return {Number}
 */
exports.getRandomDelay = function () {
  return Math.floor(Math.random() * 2000);
};


/**
 * Executes a function after a delay
 * @param  {Function} fn    Function to run after delay time expires
 * @param  {Number}   delay Time to wait before running fn
 */
exports.runAfterDelay = function (fn, delay) {
  // Create a span manually, members[0] is the req Object
  var delaySpan = tracing.getActiveTrace().createSpan({
    name: 'delay'
  });

  // Add progress updates as "processing" completes
  setTimeout(function () {
    delaySpan.record('25% complete');
  }, delay * 0.25);
  setTimeout(function () {
    delaySpan.record('50% complete');
  }, delay * 0.5);
  setTimeout(function () {
    delaySpan.record('75% complete');
  }, delay * 0.75);


  setTimeout(function () {
    delaySpan.end();
    fn();
  }, delay);
};
