Tracing Middleware for Express Applications
===========================================

Tracing middleware for express applications. Uses a tryfer-like format for
implementation of the data format for traces.

## Usage Example
The example in the _/example_ folder demonstrates a few things:

* Get a tracing instance via _getInstance_
* Adding the tracing middleware via _app.use_, with a tracer that will write
  our request events to stdout
* IncomingRequest (req) has a _trace_ property added i.e _req.trace_
* _req.trace_ exposes a _createSpan_ function that returns a span instance
* A span instance can be used to time request operations using _start_ and
  _end_ functions
* How to wrap your asynchronous functions so that they automatically generate
span information
* How to add "events" to a span by calling _span.record_


## API

#### getInstance (params)
Returns an instance of the tracing module. Params should be an Object that can
contain:

* appId - Required. An ID for this (micro)service so we the trace receiver can
identify it
* sanatizeUrl - Optional. Function that can be used to alter the URL before
it's sent to the tracer. Should accept, and return, a String (req.url)
* sanatizeHeaders - Optional. Function that can be used to alter the headers
before they're sent to the tracer. It should accept, and return, an Object
(req.headers)

#### fhlog
The FHLog instance being used by this module, can be used to enable logs.

#### FHServiceTracer
A tracer that can send traces to a FeedHenry mBaaS. Must be passed an Object
containing the keys:

* fh - An _fh-mbaas-api_ instance.
* guid: An _AppID_ for the mBaaS you want to send traces to.

#### LogTracer
Tracer that prints traces to stdout.
