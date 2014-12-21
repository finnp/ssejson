var PassThrough = require('stream').PassThrough
var through = require('through2')
var split = require('split2')
var splicer = require('stream-splicer')


function fromEventSource(source, event) {
  
  if(typeof source == 'string')
    source = new EventSource(source)
  
  var pass = new PassThrough({objectMode: true})
  
  if(event) {
    source.addEventListener(event, parse)
  } else {
    source.onmessage = parse
  }
  
  function parse(e) {
    var message = JSON.parse(e.data)
    pass.write(message)
  }

  source.onerror = function (e) {
    pass.end()
    source.close() // when the connection is closed
  }
  
  return pass
}

function serialize(opts) {
  if(typeof opts === 'string') opts = {'event': opts}
  var serializer = through.obj(function (data, enc, cb) {
    if(opts && opts.event) this.push('event: ' + opts.event + '\n')
    this.push('data: ' + JSON.stringify(data) + '\n\n')
    cb(null)
  })
  
  serializer.destroy = function (err) {
    if (this._destroyed) return
    this._destroyed = true
    var self = this
    process.nextTick(function () {
      opts.event = 'error'
      if(err) serializer.write({message: err.message})
      self.emit('end')
      self.emit('close')
    })
  }
  
  return serializer
}

var parse = function (opts) {
  opts = opts || {}
  if(typeof opts === 'string') opts = {'event': opts}
  return splicer.obj([
      split('\n\n'),
      through.obj(function (line, enc, cb) {
        // console.log(line.toString())
        line = line.toString()
        var message = line
        if(opts.event) {
          var parts = line.split('\n')
          if(parts[0] != 'event: ' + opts.event) return cb(null) // next
          message = parts[1]
        }
         if (message.indexOf('data: ') === 0) {
           var data
           try {
             data = JSON.parse(message.slice(6))
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