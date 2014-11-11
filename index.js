var PassThrough = require('stream').PassThrough

function fromEventSource(source) {
  
  if(typeof source == 'string')
    source = new EventSource(source)
  
  var pass = new PassThrough({objectMode: true})

  source.onmessage = function (e) {
    var message = JSON.parse(e.data)
    pass.write(message)
  }

  source.onerror = function (e) {
    pass.end()
    source.close() // when the connection is closed
  }
  
  return pass
}

var through = require('through2')
function serialize(opts) {

  return through.obj(function (data, enc, cb) {
    if(opts.event) this.push('event: ' + opts.event + '\n')
    this.push('data: ' + JSON.stringify(data) + '\n\n')
    cb(null)
  })

}

var split = require('split2')
var splicer = require('stream-splicer')

var parse = function () {
  return splicer.obj([
      split('\n\n'),
      through.obj(function (line, enc, cb) {
        // console.log(line.toString())
        line = line.toString()
         if (line.indexOf('data: ') === 0) {
           var data
           try {
             data = JSON.parse(line.slice(6))
           } catch(e) {
             return cb(e)
           }
         }
        cb(null, data)
      })
    ])
}
  

module.exports = {
  serialize: serialize,
  fromEventSource: fromEventSource,
  parse: parse
}