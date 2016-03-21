'use strict';

var map = require('lodash.map')
  , log = require('fhlog').get('span-store')
  , uuid = require('uuid');


function defaultSanatizeUrl (url) {
  return url;
}


function defaultSanatizeHeaders (headers) {
  return headers;
}


module.exports = function (opts) {

  // If user does not wish to sanatize urls that's fine
  /* istanbul ignore else*/
  if (!opts.sanatizeUrl) {
    opts.sanatizeUrl = defaultSanatizeUrl;
  }

  // If user does not wish to sanatize headers that's fine too
  /* istanbul ignore else*/
  if (!opts.sanatizeHeaders) {
    opts.sanatizeHeaders = defaultSanatizeHeaders;
  }

  var store = {};
  var spans = store.spans = [];

  /**
   * Write the stored spans to all tracers being used
   * @param  {Error} err An error if one occurred during the life of the request
   * @return {undefined}
   */
  store.writeToTracers = function (err) {
    opts.tracers.forEach(function sendTracesForTracer (t) {
      t.record(err, {
        method: opts.req.method,
        url: opts.sanatizeUrl(opts.req.url),
        headers: opts.sanatizeHeaders(opts.req.headers),
        appId: opts.appId,
        spans: map(spans, function (s) {
          return s.getEvents();
        }),
        uuid: uuid.v4() // TODO: Not required since db will generate an ID?
      }, function (err) {
        if (err) {
          log.w(
            'failed to send traces for tracer "%s": %s',
            t.constructor.name,
            err
          );
          log.w(err.stack || 'no error stack available');
        }
      });
    });
  };

  return store;
};
