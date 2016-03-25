'use strict';

var expect = require('chai').expect
  , sinon = require('sinon');

describe('fh-service-tracer', function () {
  var FHServiceTracer = require('lib/tracers/fh-service-tracer')
    , instance = null
    , serviceStub = null
    , guid = '123456789012345678901212'
    , traces = {};

  beforeEach(function () {
    serviceStub = sinon.stub();

    traces = {
      spans: {}
    };

    instance = new FHServiceTracer({
      fh: {
        service: serviceStub
      },
      guid: guid
    });
  });

  describe('#FHServiceTracer', function () {
    it('should throw an AssertionError, opts', function () {
      expect(function () {
        return new FHServiceTracer();
      }).to.throw('AssertionError');
    });

    it('should throw an AssertionError, opts.fh', function () {
      expect(function () {
        return new FHServiceTracer({});
      }).to.throw('AssertionError');
    });

    it('should throw an AssertionError, opts.guid', function () {
      expect(function () {
        return new FHServiceTracer({
          fh: {},
          guid: null
        });
      }).to.throw('AssertionError');
    });

    it('should throw an AssertionError, opts.guid.length', function () {
      expect(function () {
        return new FHServiceTracer({
          fh: {},
          guid: '1234567890123456789012'
        });
      }).to.throw('AssertionError');
    });

    it('should create an instance', function () {
      var t = new FHServiceTracer({
        fh: {},
        guid: '123456789012345678901212'
      });

      expect(t).to.be.an('object');
    });
  });


  describe('#record', function () {
    // method: 'POST',
    // path: '/traces',
    // guid: this.opts.guid,
    // timeout: this.opts.timeout || 15000,
    // params: traceJson
    it('should send traces successfully', function (done) {
      serviceStub.callsArgWith(1, null, '', {
        statusCode: 200
      });

      instance.record(null, traces, function (err, res) {
        expect(err).to.be.null;
        expect(res).to.be.null;

        expect(serviceStub.called).to.be.true;
        expect(serviceStub.getCall(0).args[0].method).to.equal('POST');
        expect(serviceStub.getCall(0).args[0].path).to.equal('/trace');
        expect(serviceStub.getCall(0).args[0].guid).to.equal(guid);
        expect(serviceStub.getCall(0).args[0].timeout).to.equal(15000);
        expect(serviceStub.getCall(0).args[0].params).to.equal(traces);

        done();
      });
    });

    it('should handle non 200 status code', function (done) {
      serviceStub.callsArgWith(1, null, '', {
        statusCode: 500
      });

      instance.record(null, traces, function (err) {
        expect(err).to.be.an('object');
        expect(err.toString()).to.contain('failed to send traces');
        expect(serviceStub.called).to.be.true;

        done();
      });
    });

    it('should handle http errors', function (done) {
      serviceStub.callsArgWith(1, new Error('uh oh'));

      instance.record(null, traces, function (err) {
        expect(err).to.be.an('object');
        expect(err.toString()).to.contain('uh oh');
        expect(serviceStub.called).to.be.true;

        done();
      });
    });
  });
});
