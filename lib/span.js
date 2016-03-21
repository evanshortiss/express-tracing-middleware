'use strict';

var assert = require('assert')
  , eventTypes = require('./trace-events').events
  , find = require('lodash.find');

module.exports = function (opts) {

  var span = {}
    , events = [];

  assert.equal(
    typeof opts,
    'object',
    'options passed to "createSpan" must be an object'
  );

  assert.equal(
    typeof opts.name,
    'string',
    'opts.name passed to "createSpan" must be a string'
  );


  /**
   * Find the given event name and return it if it exists
   * @param  {String} name
   * @return {Object}
   */
  function findEventByType (name) {
    return find(events, function (evt) {
      return (evt.type === name);
    });
  }


  /**
   * Record an event to all tracers associated with this Trace
   * @param  {Annotation} a
   */
  function record (name, detail, type) {
    events.push({
      // "span-start" and "span-end" are default types, but generic events can
      // be recorded through the lifespan (heh, geddit?!) of a span. These
      // generic events are simply considered that; 'event'
      type: type || 'event',
      ts: Date.now(),
      detail: detail || '',
      name: opts.name
    });
  }


  /**
   * Used to ensure events are not being fired incorrectly.
   * This is important to ensure data consistency
   * @param  {String} fn
   * @param  {String} evt
   */
  function assertNotFired (fn, evt) {
    assert(
      !findEventByType(evt),
      'Cannot call "'.concat(fn).concat('" after calling "' + evt + '"')
    );
  }


  /**
   * Used to ensure events are not being fired incorrectly.
   * This is important to ensure data consistency
   * @param  {String} fn
   * @param  {String} evt
   */
  function assertFired (fn, evt) {
    assert(
      findEventByType(fn),
      'Must call "'.concat(fn).concat('" before calling "' + evt + '"')
    );
  }


  /**
   * Returns any events recorded by this span
   * @return {Array}
   */
  span.getEvents = function () {
    return events;
  };


  /**
   * Make this span a one time event.
   * @throws {AssertionError} If "start", "end" or "oneTime" has been called
   * @return {Undefined}
   */
  span.record = (function () {

    // The "start" event is recorded automatically by default to save developers
    // from manually calling it every time
    /* istanbul ignore else*/
    if (opts.autostart !== false) {
      record(eventTypes.SPAN_START, null, eventTypes.SPAN_START);
    }

    // Allow a span to be called an passed an inital event for berevity
    /* istanbul ignore else*/
    if (opts.initEvent) {
      record(opts.initEvent);
    }

    return function (detail) {
      record(opts.name, detail);
    };
  })();


  /**
   * Create a start timestamp for this span
   * @throws {AssertionError} If "start" or "end" has been called
   * @return {Undefined}
   */
  span.start = function () {
    assertNotFired(eventTypes.SPAN_START, eventTypes.SPAN_START);
    assertNotFired(eventTypes.SPAN_END, eventTypes.SPAN_START);

    record(opts.name, null, eventTypes.SPAN_START);
  };


  /**
   * Create a start timestamp for this span
   * @throws {AssertionError}   If "start" has not been called, of if "end" was
   *         										called already
   * @return {Undefined}
   */
  span.end = function () {
    assertFired(eventTypes.SPAN_START, eventTypes.SPAN_END);
    assertNotFired(eventTypes.SPAN_END, eventTypes.SPAN_END);

    record(opts.name, null, eventTypes.SPAN_END);
  };


  return span;
};
