'use strict';

var expect = require('chai').expect
  , proxyquire = require('proxyquire')
  , sinon = require('sinon');

describe('span-store', function () {
  var mod
    , uuid;

  beforeEach(function () {
    delete require.cache[require.resolve('lib/span-store')];

    uuid = sinon.stub();

    mod = proxyquire('lib/span-store', {
      uuid: {
        v4: uuid
      }
    });
  });

  it('should be a function', function () {
    expect(mod).to.be.a('function');
  });

  describe('#spans', function () {
    it('should be an array', function () {
      expect(mod({}).spans).to.be.an('array');
    });
  });


  describe('#writeToTracers', function () {
    it('should be a function', function () {
      expect(mod({}).writeToTracers).to.be.a('function');
    });

    it('should write a span to tracers with no error', function () {

      var traceUuid = '123';

      var tracerStub = {
        record: sinon.stub()
      };

      var appId = 'an awesome app';

      var spanStub = {
        getEvents: sinon.stub()
      };

      var req = {
        method: 'GET',
        url: '/test/data',
        headers: {
          'Content-Type': 'application/json'
        }
      };

      var spanData = {
        name: 'get-data',
        type: 'event',
        ts: Date.now()
      };

      var store = mod({
        req: req,
        appId: appId,
        tracers: [tracerStub]
      });

      // Ensure our uuid stub uses a dummy uuid value
      uuid.returns(traceUuid);

      // Our fake span must return events
      spanStub.getEvents.returns(spanData);

      // Add an object that mimics span format
      store.spans.push(spanStub);

      // Ensure we trigger the callback passed to the tracer
      tracerStub.record.callsArgWith(2, null, null);

      // Finally...invoke our function
      store.writeToTracers(null);

      expect(tracerStub.record.called).to.be.true;
      expect(tracerStub.record.getCall(0).args[0]).to.be.null;
      expect(tracerStub.record.getCall(0).args[1]).to.be.an('object');
      expect(tracerStub.record.getCall(0).args[1]).to.deep.equal({
        url: req.url,
        headers: req.headers,
        appId: appId,
        spans: [spanData],
        uuid: traceUuid,
        method: 'GET'
      });

    });


    it('should write a span to tracers with no error', function () {

      var traceUuid = '123';

      var tracerStub = {
        record: sinon.stub()
      };

      var appId = 'an awesome app';

      var spanStub = {
        getEvents: sinon.stub()
      };

      var req = {
        method: 'GET',
        url: '/test/data',
        headers: {
          'Content-Type': 'application/json'
        }
      };

      var spanData = {
        name: 'get-data',
        type: 'event',
        ts: Date.now()
      };

      var store = mod({
        req: req,
        appId: appId,
        tracers: [tracerStub]
      });

      // Ensure our uuid stub uses a dummy uuid value
      uuid.returns(traceUuid);

      // Our fake span must return events
      spanStub.getEvents.returns(spanData);

      // Add an object that mimics span format
      store.spans.push(spanStub);

      // Ensure we trigger the callback passed to the tracer
      tracerStub.record.callsArgWith(2, 'err string', null);

      // Finally...invoke our function
      store.writeToTracers(null);
    });
  });

});
