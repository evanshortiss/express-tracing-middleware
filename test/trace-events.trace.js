'use strict';

var expect = require('chai').expect;

describe('trace-events', function () {
  var mod = require('lib/trace-events');

  it('should export events', function () {
    expect(mod.events).to.be.an('object');
  });
});
