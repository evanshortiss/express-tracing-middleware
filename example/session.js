'use strict';

module.exports = function verifySession (callback) {
  setTimeout(function () {
    // No error thrown...fake session is fine
    callback(null);
  }, require('./util').getRandomDelay());
};
