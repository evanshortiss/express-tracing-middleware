'use strict';

var trace = require('./trace.js')
  , assert = require('assert')
  , xtend = require('xtend');

module.exports = function (opts) {

  var store = {}
    , tracers = [];


  /**
   * Add a tracer to this store instance
   * @param {Tracer} tracer
   */
  store.add = function (tracer) {
    assert(
      typeof tracer.send,
      'function',
      'tracer.send must be a function on tracer passed to store.add'
    );

    assert(
      typeof tracer.record,
      'function',
      'tracer.send must be a function on tracer passed to store.add'
    );

    tracers.push(tracer);
  };


  /**
   * Remove the specified tracer from this store
   * @param  {Tracer} tracer
   */
  store.remove = function (tracer) {
    tracers.splice(tracers.indexOf(tracer));
  };


  /**
   * Returns the tracers stored by this store
   * @return {Array}
   */
  store.getTracers = function () {
    return tracers;
  };


  /**
   * Create a trace object that can be used to update all tracers in this store
   * @return {FHTrace}
   */
  store.createTrace = function (req, res) {
    return trace(
      xtend(opts, {
        req: req,
        res: res,
        tracers: tracers
      })
    );
  };

  return store;
};
