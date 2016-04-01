'use strict';

var expect = require('chai').expect
  , sinon = require('sinon')
  , proxyquire = require('proxyquire');

describe('public interface', function () {

  var mod
    , appId = 'node.js ftw'
    , validOpts = {
      appId: appId
    }
    , traceStoreStub;

  beforeEach(function () {
    traceStoreStub = sinon.stub();

    mod = proxyquire('index.js', {
      './lib/tracer-store': traceStoreStub
    });
  });

  describe('#getInstance', function () {
    it('should return a middleware instance', function () {
      var i = mod.getInstance(validOpts);

      expect(i).to.be.an('object');

      expect(i).to.have.property('tracers');
      expect(i).to.have.property('events');
      expect(i).to.have.property('middleware');

      expect(traceStoreStub.called).to.be.true;
      expect(traceStoreStub.getCall(0).args[0]).to.deep.equal(validOpts);
    });

    it('should fail due to invalid opts type', function () {
      expect(function () {
        mod.getInstance('invalid opts');
      }).to.throw('AssertionError');
    });

    it('should fail due to invalid appId type', function () {
      expect(function () {
        mod.getInstance({
          appId: 123567890
        });
      }).to.throw('AssertionError');
    });
  });

  describe('#middleware', function () {
    it('should attach a "trace" to the request', function (done) {
      var createStub = sinon.stub();
      var trace = {id:'123'};

      createStub.returns(trace);

      traceStoreStub.returns({
        createTrace: createStub
      });

      var i = mod.getInstance(validOpts)
        , req = {}
        , res = {};

      i.middleware(req, res, function (err) {
        expect(err).to.not.exist;
        expect(req.trace).to.deep.equal(trace);
        done();
      });
    });

    it('should attach a "trace" to the request', function (done) {
      var createStub = sinon.stub();
      createStub.throws(new Error('cannot bind trace'));

      traceStoreStub.returns({
        createTrace: createStub
      });

      var i = mod.getInstance(validOpts)
        , req = {}
        , res = {};

      i.middleware(req, res, function (err) {
        expect(err).to.exist;
        expect(req.trace).to.not.exist;
        done();
      });
    });
  });

  describe('#getActiveTrace', function () {
    it('should throw an error', function () {
      expect(function () {
        mod.getActiveTrace();
      }).to.throw(Error);
    });

    it('should return a domain', function () {
      var dummyDomain = {
        enter: function () {},
        exit: function () {},
        members: [{
          trace: {
            tracify: function () {}
          }
        }]
      };

      // Mock out an active domain, the lazy way
      process.domain = dummyDomain;

      var t = mod.getActiveTrace();

      expect(t).to.deep.equal(dummyDomain.members[0].trace);

      process.domain = undefined;
    });
  });

});
