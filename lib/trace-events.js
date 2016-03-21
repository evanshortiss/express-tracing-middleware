'use strict';

exports.events = {
  // Triggered when a trace is created
  SERVER_RECEIVE: 'server-receive',

  // Indicates "res.end" etc., was called in the express application
  SERVER_SEND: 'server-send',

  // Indicates the end of a span i.e processing for this segment is complete
  SPAN_END: 'span-end',

  // Indicates the start of a span i.e processing for this segment is starting
  SPAN_START: 'span-start'
};
