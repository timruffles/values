
var vo = require("./values2")

function assert(t,msg) { if(!t) throw new Error(msg) }

var Period = function Period() {
  var existing = vo.memoizedConstructor(Period,arguments);
  if(existing) return existing;
  vo.set(this,"from","to",arguments);
};

var oneToTen = new Period(1,10);
var naturalNumbersUnderEleven = new Period(1,10)

assert( oneToTen === naturalNumbersUnderEleven );
assert( oneToTen.to === 10 )

var twoToTen = oneToTen.derive({from: 2})

assert( twoToTen.from === 2 )
assert( twoToTen.to   === 10 )
assert( oneToTen.from === 1 )
assert( twoToTen.constructor === Period )
