Tracing Middleware for Express Applications
===========================================

NOTE: This module is not yet published, so you'll need to add this repo in your
package.json to use it.

Tracing middleware for express applications. Uses a tryfer-like format for
implementation of the data format for traces.

## Usage Example

Take the program below for an example:

```js
'use strict';

var app = require('express')()
  , tracing = require('express-tracing-middleware')
  , verifySession = require('./session.js');

var mw = tracing.getInstance({
  appId: '123456789012345678901212'
});

mw.tracers.add(
  new tracing.LogTracer({
    maxNameLength: 14, // Truncate any span details longer than 14 chars
  })
);

app.use(mw.middleware);

app.get('/*', function (req, res, next) {

  // This will wrap an asynchronous function in a light wrapper to time it.
  // The function will work just like you'd expect, but it gets timed
  var timedSession = req.trace.tracify(verifySession);

  timedSession(function (err) {
    if (err) {
      next(err);
    } else {
      res.send('ok');
    }
  });
});

app.listen(3000);
```

Hitting http://localhost:3000/any-url-you-like will print the following in the
console:

```
====== Trace Start ======
GET: /any-url-you-like

[2016-03-24T22:33:45.954Z] - event      - server-receive -
[2016-03-24T22:33:45.956Z] - span-start - verifySession  -
[2016-03-24T22:33:45.991Z] - span-end   - verifySession  -
[2016-03-24T22:33:45.996Z] - event      - server-send    -
====== Trace End ======
```

## Moar Examples!?
Check out the examples folder for the code. Or run them using the below
commands from the root of the project.

### Simple Example
```
npm run simple-example
```

Now hit http://localhost:3000/something and checkout what your terminal displays.

### Complex Example
```
npm run example
```

Now hit http://localhost:3000/something and checkout what your terminal displays.

## Anatomy of a Trace
Each incoming request will have a _trace_ property attached by the middleware.
The trace is used to record request events/timing. A *trace* is the life of a
request, represented using an Object that contains a series of *spans*.

### Spans
Spans are also Objects, and they represent the execution
time of a function, or a one time event that occurs during the execution of a
function.

Spans contain events of three types:

* event - A generic event you'd like to record.
* span-start - The start of this span (execution started).
* span-end - The end of this span (execution ended).

Each span can also have a name associated with it. Typically this will be the
name of the function being timed, but might also be *server-receive* or
*server-send* which are auto generated events when a request is received and
responded to respectively.

## API

### Module

#### module.getInstance (params)
Returns an instance of the tracing module. Params should be an Object that can
contain:

* appId - Required. An ID for this (micro)service so we the trace receiver can
identify it
* sanatizeUrl - Optional. Function that can be used to alter the URL before
it's sent to the tracer. Should accept, and return, a String (req.url)
* sanatizeHeaders - Optional. Function that can be used to alter the headers
before they're sent to the tracer. It should accept, and return, an Object
(req.headers)

#### module.fhlog
The FHLog instance being used by this module, can be used to enable logs.

#### module.FHServiceTracer
A tracer that can send traces to a FeedHenry mBaaS. Must be passed an Object
containing the keys:

* fh - An _fh-mbaas-api_ instance.
* guid: An _AppID_ for the mBaaS you want to send traces to.

#### module.LogTracer
Tracer that prints traces to stdout.


### instance

#### tracers
A store that can be used to add tracers. Tracers are used to write traces to
an output, e.g stdout, a database, or an API.

#### tracers.add(t)
Add a new tracer.

#### tracers.getTracers()
Get currently added tracers

#### tracers.createTrace
Create a trace object. This is how *req.trace* is created for you.

#### middleware
This is the express middleware function that can be mounted using
*app.use(instance.middleware)*.
