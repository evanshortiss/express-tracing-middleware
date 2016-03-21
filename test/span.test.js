'use strict';

var expect = require('chai').expect
  , proxyquire = require('proxyquire')
  , sinon = require('sinon');

describe('tracer-store', function () {
  var createSpan
    , tracerStub
    , recordStub
    , traceStub
    , sendStub
    , span;

  beforeEach(function () {
    recordStub = sinon.stub();
    sendStub = sinon.stub();
    traceStub = sinon.stub();

    delete require.cache[require.resolve('lib/span')];

    createSpan = proxyquire('lib/span', {
      './trace.js': traceStub
    });

    tracerStub = {
      record: recordStub,
      send: sendStub
    };

    span = createSpan({
      name: 'testname',
      autostart: false
    });
  });

  it('should create a span with an initEvent', function () {
    expect(createSpan({
      initEvent: 'testevent',
      name: 'testname',
      autostart: false
    }).getEvents()).to.have.length(1);
  });

  it('should have used "autostart" to add "start" for us', function () {
    expect(createSpan({
      name: 'testname',
    }).getEvents()).to.have.length(1);
  });

  describe('#getEvents', function () {
    it('should return an empty array', function () {
      expect(span.getEvents()).to.have.length(0);
    });
  });

  describe('#record', function () {
    it('should record an event', function () {
      span.record('test');

      var evts = span.getEvents();

      expect(evts).to.have.length(1);

      expect(evts[0]).to.have.property('type');
      expect(evts[0]).to.have.property('ts');
      expect(evts[0]).to.have.property('name');
      expect(evts[0].type).to.equal('event');
    });
  });


  describe('#start', function () {
    it('should record a "start" event', function () {
      span.start();

      var evts = span.getEvents();

      expect(evts).to.have.length(1);

      expect(evts[0]).to.have.property('type');
      expect(evts[0]).to.have.property('ts');
      expect(evts[0]).to.have.property('name');
      expect(evts[0].type).to.equal('span-start');
    });

    it('should throw an assertion error', function () {
      span.start();

      expect(function () {
        span.start();
      }).to.throw('AssertionError');
    });
  });

  describe('#end', function () {
    it('should record a "end" event', function () {
      span.start();
      span.end();

      var evts = span.getEvents();

      expect(evts).to.have.length(2);

      expect(evts[0]).to.have.property('type');
      expect(evts[0]).to.have.property('ts');
      expect(evts[0]).to.have.property('name');
      expect(evts[0].type).to.equal('span-start');
      expect(evts[1]).to.have.property('type');
      expect(evts[1]).to.have.property('ts');
      expect(evts[1]).to.have.property('name');
      expect(evts[1].type).to.equal('span-end');
    });

    it('should throw an assertion error, "start" not called', function () {
      expect(function () {
        span.end();
      }).to.throw('AssertionError');
    });

    it('should throw an assertion error, "end" called twice', function () {
      span.start();
      span.end();

      expect(function () {
        span.end();
      }).to.throw('AssertionError');
    });
  });

});
