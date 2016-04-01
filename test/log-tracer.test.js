'use strict';

var expect = require('chai').expect
  , sinon = require('sinon');

describe('#LogTracer', function () {

  var LogTracer = require('lib/tracers/log-tracer')
    , logSpy = null
    , olog = console.log
    , dummyTrace;

  beforeEach(function () {
    olog = console.log;
    logSpy = sinon.spy();

    console.log = logSpy;

    dummyTrace = {
      method: 'GET',
      url: '/stuff',
      headers: {},
      appId: 'appId',
      statusCode: 200,
      spans: [
        [
          {
          ts: 123567890,
          type: 'event',
          name: 'getStuff',
          detail: 'this is slow...'
          }
        ]
      ],
      uuid: '123',
    };
  });

  afterEach(function () {
    console.log = olog;
  });

  it('should create an instance with defaults', function () {
    var i = new LogTracer();

    expect(i.record).to.be.a('function');
    expect(i.opts.maxNameLength).to.equal(15);
    expect(i.opts.logRaw).to.equal(false);
  });

  it('should create an instance with custom opts', function () {
    var i = new LogTracer({
      maxNameLength: 50,
      logRaw: true
    });

    expect(i.record).to.be.a('function');
    expect(i.opts.maxNameLength).to.equal(50);
    expect(i.opts.logRaw).to.equal(true);
  });

  it('should create an instance with partial custom opts', function () {
    var i = new LogTracer({
      maxNameLength: 50
    });

    expect(i.record).to.be.a('function');
    expect(i.opts.maxNameLength).to.equal(50);
    expect(i.opts.logRaw).to.equal(false);
  });

  it('should log raw format', function () {
    var i = new LogTracer({
      logRaw: true
    });

    i.record(null, dummyTrace, function (err, res) {
      expect(logSpy.called).to.be.true;
      expect(err).to.be.null;
      expect(res).to.be.null;
    });
  });

  it('should log pretty format', function () {
    var i = new LogTracer({
      logRaw: false
    });

    i.record(null, dummyTrace, function (err, res) {
      expect(logSpy.called).to.be.true;
      expect(err).to.be.null;
      expect(res).to.be.null;
    });
  });

});
