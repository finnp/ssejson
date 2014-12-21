# ssejson

Windows | Mac/Linux
------- | ---------
[![Windows Build status](http://img.shields.io/appveyor/ci/finnp/ssejson.svg)](https://ci.appveyor.com/project/finnp/ssejson/branch/master) | [![Build Status](https://travis-ci.org/finnp/ssejson.svg?branch=master)](https://travis-ci.org/finnp/ssejson)

Serializing and parsing Object Streams for server sent events using the EventSource api.

On the server side use `ssejson.serialize()` to turn the objectstream to sse, on the
(browser) client use `ssejson.fromEventSource()` to parse it back to an objectstream.


The format is pretty simple each object chunk is encoded as JSON as the name suggests
and serialized and parsed by the module.

## Serialize Example
```js
var http = require('http')
var fs = require('fs')
var ssejson = require('ssejson')
var csv = require('csv-parser')
http.createServer(function (req, res) {
  fs.createReadStream('data.csv')
    .pipe(csv())
    .pipe(ssejson.serialize())
    .pipe(res)
})
```

The serializer allows an options object to be passed as the first argument. There
you can specify an `event` attribute and it will use the name you specify there instead
of sending unnamed messages.

## fromEventSource Example

For the Use with the browser `EventSource` api, but should also work with compliant replacements like the 
[eventsource](https://www.npmjs.org/package/eventsource) module.

The second argument is optional and declares the name of the event. Without specifying
it defaults to unnamed messages.

```js
var htmltable = require('htmltable')
var ssejson = require('ssejson')

ssejson.fromEventSource(new EventSource('/'), 'data')
  .pipe(htmltable(document.querySelector('#data')))
```

## Parse Example

If you have access to the raw sse you can parse it this way.
You can specify the `event` option to parse named events.

```js
  var request = require('request')
  var ssejson = require('ssejson')
  
  request('/sse')
    .pipe(ssejson.parse())
    .on('data', function (row) {
      console.log(row)
    })
```