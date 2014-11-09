var ssejson = require('./')
var EventSource = require('eventsource')
var http = require('http')
var assert = require('assert')

// this should be replaced with proper tests :)

http.createServer(function (req, res) {
  var input = ssejson.serialize()

  input
    .pipe(ssejson.parse())
    .pipe(ssejson.serialize())
    .pipe(res)
    
  input.write({a: 1, b: 10})
  input.write({a: 2, b: 20})
  input.end()
}).listen(8181)

ssejson.fromEventSource(new EventSource('http://localhost:8181'))
  .on('data', function (data) {
    assert(data.a * 10 == data.b)
  })
  .on('finish', function () {
    console.log('pass')
    process.exit()
  })