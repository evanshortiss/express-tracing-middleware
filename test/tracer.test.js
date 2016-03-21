'use strict';

var expect = require('chai').expect;

describe('tracer', function () {
  var Tracer = require('lib/tracer');

  describe('#record', function () {
    it('should throw an error', function () {
      var t = new Tracer();

      expect(function () {
        t.record();
      }).to.throw(Error);
    });
  });

});
