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
  
  t.test('destroy with error', function (t) {
    t.plan(1)
    var stream = ssejson.serialize({event: false})
    stream.pipe(concat(function (sse) {
      t.equal(sse, 'data: {"a":1}\n\nevent: error\ndata: {"message":"omg"}\n\n')
    }))
    stream.write({a: 1})
    stream.destroy(new Error('omg'))    
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
  
  t.test('event: cat', function (t) {
    var stream = ssejson.parse({event: 'cat'})
    t.plan(2)
    stream.pipe(concat(function (arr) {
      t.equal(arr[0].a, 1)
      t.equal(arr[1].b, 2)
    }))
    stream.end('event: cat\ndata: {"a":1}\n\nevent: dog\ndata: {"fail": 1}\n\nevent: cat\ndata: {"b":2}\n\ndata: false\n\n')
  })
})


test('fromEventSource', function (t) {


  t.test('onmessage', function (t) {
    var server = http.createServer(function (req, res) {
      var output = ssejson.serialize()
      
      output.pipe(res)
      
      output.write({a: 1, b: 2})
      output.write({a: 2, b: 3})
      output.end()
    })
    server.listen(8181)
    
    t.plan(3)
    ssejson.fromEventSource(new EventSource('http://localhost:8181'))
      .on('data', function (data) {
        t.equal(data.a + 1, data.b)
      })
      .on('finish', function () {
        t.pass('stream ends')
        server.close()
      })
  })
  
  t.test('event: test', function (t) {
    var server = http.createServer(function (req, res) {
      var output = ssejson.serialize('test')
      
      output.pipe(res)
      
      output.write({a: 1, b: 2})
      output.write({a: 2, b: 3})
      output.end()
    })
    server.listen(8181)
    t.plan(3)
    ssejson.fromEventSource(new EventSource('http://localhost:8181'), 'test')
    .on('data', function (data) {
      t.equal(data.a + 1, data.b)
    })
    .on('finish', function () {
      t.pass('stream ends')
      server.close()
    })
  })

  

})
