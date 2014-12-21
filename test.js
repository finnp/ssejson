var ssejson = require('./')
var EventSource = require('eventsource')
var http = require('http')
var concat = require('concat-stream')
var test = require('tape')
// this should be replaced with proper tests :)

test('serialize', function (t) {
  t.test('event: data', function (t) {
    t.plan(1)
    var stream = ssejson.serialize({event: 'data'})
    stream.pipe(concat(function (sse) {
      t.equal(sse, 'event: data\ndata: {"a":1}\n\nevent: data\ndata: {"b":2}\n\n')
    }))
    stream.write({a: 1})
    stream.write({b: 2})
    stream.end()
  })

  t.test('onmessage', function (t) {
    t.plan(1)
    var stream = ssejson.serialize({event: false})
    stream.pipe(concat(function (sse) {
      t.equal(sse, 'data: {"a":1}\n\ndata: {"b":2}\n\n')
    }))
    stream.write({a: 1})
    stream.write({b: 2})
    stream.end()
  })
})

test('parse', function (t) {
  t.test('onmessage', function (t) {
    var stream = ssejson.parse()
    t.plan(2)
    stream.pipe(concat(function (arr) {
      t.equal(arr[0].a, 1)
      t.equal(arr[1].b, 2)
    }))
    stream.end('data: {"a":1}\n\ndata: {"b":2}\n\n')
  })
  
  t.test('onmessage with other data', function (t) {
    var stream = ssejson.parse()
    t.plan(2)
    stream.pipe(concat(function (arr) {
      t.equal(arr[0].a, 1)
      t.equal(arr[1].b, 2)
    }))
    stream.end('data: {"a":1}\n\nevent: other\ndata: {"fail": true}\n\ndata: {"b":2}\n\n')    
  })
})


test('fromEventSource', function (t) {
  t.plan(3)
  var server = http.createServer(function (req, res) {
    var input = ssejson.serialize()

    input
      .pipe(ssejson.parse())
      .pipe(ssejson.serialize())
      .pipe(res)
      
    input.write({a: 1, b: 2})
    input.write({a: 2, b: 3})
    input.end()
  })
  
  server.listen(8181)

  ssejson.fromEventSource(new EventSource('http://localhost:8181'))
    .on('data', function (data) {
      t.equal(data.a + 1, data.b)
    })
    .on('finish', function () {
      server.close()
      t.pass('stream ends')
    })
})
