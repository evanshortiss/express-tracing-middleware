'use strict';

var expect = require('chai').expect
  , proxyquire = require('proxyquire')
  , sinon = require('sinon');

describe('span-store', function () {
  var mod
    , spanStub
    , spanStoreStub
    , spanStorePushStub
    , finishedStub
    , writeTracerStub
    , spanInstanceStubEnd;


  beforeEach(function () {
    delete require.cache[require.resolve('lib/trace')];

    spanStub = sinon.stub();
    spanStoreStub = sinon.stub();
    spanStorePushStub = sinon.stub();
    finishedStub = sinon.stub();
    writeTracerStub = sinon.stub();
    spanInstanceStubEnd = sinon.stub();


    // Mimic the return of a span-store call
    spanStoreStub.returns({
      spans: {
        push: spanStorePushStub
      },
      writeToTracers: writeTracerStub
    });

    mod = proxyquire('lib/trace', {
      './span': spanStub,
      './span-store': spanStoreStub,
      'on-finished': finishedStub
    });
  });

  it('should be a function', function () {
    expect(mod).to.be.a('function');
  });

  it('should perform configuration and return a trace object', function () {
    var opts = {
      res: {
        // A fake response object that on finished expects
        socket: 'not a real socket... \o_o/'
      }
    };

    var dummySpan = {
      name: require('lib/trace-events').events.SERVER_RECEIVE,
      initEvent: require('lib/trace-events').events.SERVER_RECEIVE
    };

    // Just return some dummy data, doesn't need to be a real span object
    spanStub.returns(dummySpan);

    var trace = mod(opts);

    // An object should be returned
    expect(trace).to.be.an('object');

    // on-finished module should be passed the response stream and _end function
    expect(finishedStub.called).to.be.true;
    expect(finishedStub.getCall(0).args[0]).to.deep.equal(opts.res);
    expect(finishedStub.getCall(0).args[1]).to.equal(trace._end);

    // Should initialise a store internally
    expect(spanStoreStub.called).to.be.true;
    expect(spanStoreStub.getCall(0).args[0]).to.equal(opts);

    // Should push a server receive event into spans
    expect(spanStorePushStub.called).to.be.true;
    expect(spanStorePushStub.getCall(0).args[0]).to.deep.equal(dummySpan);
  });


  describe('#_end', function () {
    it('should write a server send and call writeToTracers', function () {
      var createdSpan = {
        name: require('lib/trace-events').events.SERVER_SEND,
        initEvent: require('lib/trace-events').events.SERVER_SEND
      };

      spanStub.returns(createdSpan);

      mod({})._end(null);

      expect(spanStorePushStub.called).to.be.true;
      expect(spanStorePushStub.getCall(0).args[0]).to.deep.equal(createdSpan);

      expect(writeTracerStub.called).to.be.true;
      expect(writeTracerStub.getCall(0).args[0]).to.be.null;
    });
  });

  describe('#createSpan', function () {
    it('should return a span object with our options applied', function () {
      var spanOpts = {
        name: 'name'
      };

      var dummySpan = {
        spans: []
      };

      spanStub.returns(dummySpan);

      var span = mod({}).createSpan(spanOpts);

      expect(spanStorePushStub.called).to.be.true;
      expect(spanStorePushStub.getCall(0).args[0]).to.deep.equal(dummySpan);

      expect(spanStub.called).to.be.true;
      expect(spanStub.getCall(1).args[0]).to.equal(spanOpts);

      expect(span).to.deep.equal(dummySpan);
    });
  });


  describe('#tracify', function () {

    it('should return a new function and use the function name', function () {
      var inst = mod({});
      spanStub.returns({
        end: spanInstanceStubEnd
      });

      function inFn (callback) {callback(null);}
      var fn = inst.tracify(inFn);

      expect(fn).to.not.equal(inFn);
      expect(spanStub.called).to.be.true;

      fn(function (err) {
        expect(err).to.not.exit;
        expect(spanStub.getCall(1).args[0].name).to.equal(inFn.name);
        expect(spanInstanceStubEnd.called).to.be.true;
      });
    });

    it('should return a new function and use the custom name', function () {
      var inst = mod({});
      spanStub.returns({
        end: spanInstanceStubEnd
      });

      function inFn (callback) {callback(null);}
      var name = '123';
      var fn = inst.tracify(inFn, name);
      expect(fn).to.not.equal(inFn);
      expect(spanStub.called).to.be.true;

      fn(function (err) {
        expect(err).to.not.exit;
        expect(spanStub.getCall(1).args[0].name).to.equal(name);
        expect(spanInstanceStubEnd.called).to.be.true;
      });
    });
  });
});
