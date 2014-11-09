var ssejson = require('./')

var input = ssejson.serialize()

input
  .pipe(ssejson.parse())
  .pipe(ssejson.serialize())
  .pipe(process.stdout)
  
input.write({a: 1, b: 2})
input.write({c: 1, d: 2})
input.end()