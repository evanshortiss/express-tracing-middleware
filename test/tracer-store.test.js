'use strict';

var expect = require('chai').expect
  , proxyquire = require('proxyquire')
  , sinon = require('sinon');

describe('tracer-store', function () {
  var store
    , tracerStub
    , recordStub
    , traceStub
    , sendStub
    , ts;

  beforeEach(function () {
    recordStub = sinon.stub();
    sendStub = sinon.stub();
    traceStub = sinon.stub();

    store = proxyquire('lib/tracer-store', {
      './trace.js': traceStub
    });

    tracerStub = {
      record: recordStub,
      send: sendStub
    };

    ts = store();
  });


  describe('#add', function () {
    it('should add a tracer to the internal array', function () {
      expect(ts.getTracers()).to.have.length(0);
      ts.add(tracerStub);
      expect(ts.getTracers()).to.have.length(1);
    });
  });

  describe('#remove', function () {
    it('should remove a tracer from the internal array', function () {
      ts.add(tracerStub);
      ts.remove(tracerStub);

      expect(ts.getTracers()).to.have.length(0);
    });
  });

  describe('#createTrace', function () {
    it('should add a tracer to the internal array', function () {
      traceStub.returns({});

      var req = {};
      var res = {};

      var createdTrace = ts.createTrace(req, res);

      expect(createdTrace).to.be.an('object');
      expect(traceStub.getCall(0).args[0].req).to.be.an('object');
      expect(traceStub.getCall(0).args[0].res).to.be.an('object');
      expect(traceStub.getCall(0).args[0].tracers).to.be.an('array');
    });
  });
  
});
