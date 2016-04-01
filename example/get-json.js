'use strict';

var tracing = require('../index.js');

module.exports = function getJson (callback) {
  // This is only possible if using domains via express-domain-middleware
  var tracifiedFunc = tracing.getActiveTrace().tracify(getJsonSlowly);

  tracifiedFunc(callback);
};


/**
 * Get a JSON Object, but slowly. Mimics an I/O bound call.
 * @param  {Function} callback
 */
function getJsonSlowly (callback) {
  setTimeout(function () {
    callback(null, {
      a: '0',
      b: '1',
      c: '2'
    });
  }, require('./util').getRandomDelay());
}
