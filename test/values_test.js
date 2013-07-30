var Period, oneToTen, naturalNumbersUnderEleven, twoToTen

buster.testCase("values", {
  "beforeAll": function() {
    Period = function Period() {
      var existing = vo.memoizedConstructor(Period,arguments);
      if(existing) return existing;
      vo.set(this,"from","to",arguments);
    }
    oneToTen = new Period(1,10);
    naturalNumbersUnderEleven = new Period(1,10)
    twoToTen = oneToTen.derive({from: 2})
  },
  "it defines accessors": function() {
    assert.equal( 10, oneToTen.to )
  },
  "it returns the same instance for a vo of same type with same fields": function() {
    assert.equal( oneToTen, naturalNumbersUnderEleven )
  },
  "derive doesn't affect existing vo": function() {
    assert.equal( 1, oneToTen.from )
    assert.equal( 10, oneToTen.to )
  },
  "derive is based on old": function() {
    assert( twoToTen.from === 2 )
    assert( twoToTen.to   === 10 )
    assert( twoToTen.constructor === Period )
  }
})





