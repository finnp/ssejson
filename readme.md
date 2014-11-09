# ssejson

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

## fromEventSource Example

For the Use with the browser `EventSource` api, but should also work with compliant replacements like the 
[eventsource](https://www.npmjs.org/package/eventsource) module.

```js
var htmltable = require('htmltable')
var ssejson = require('ssejson')

ssejson.fromEventSource(new EventSource('/'))
  .pipe(htmltable(document.querySelector('#data')))
```

## Parse Example

If you have access to the raw sse you can parse it this way

```js
  var request = require('request')
  var ssejson = require('ssejson')
  
  request('/sse')
    .pipe(ssejson.parse())
    .on('data', function (row) {
      console.log(row)
    })
```