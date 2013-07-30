var Period, oneToTen, naturalNumbersUnderEleven, twoToTen

suite("values", function(){
  before(function() {
    Period = function Period() {
      var existing = vo.memoizedConstructor(Period,arguments);
      if(existing) return existing;
      vo.set(this,"from","to",arguments);
    }
    oneToTen = new Period(1,10);
    naturalNumbersUnderEleven = new Period(1,10)
    twoToTen = oneToTen.derive({from: 2})
  })

  test("it defines accessors", function() {
    assert.equal( 10, oneToTen.to )
  })
  test("it returns the same instance for a vo of same type with same fields", function() {
    assert.equal( oneToTen, naturalNumbersUnderEleven )
  })
  test("derive doesn't affect existing vo", function() {
    assert.equal( 1, oneToTen.from )
    assert.equal( 10, oneToTen.to )
  })

  test("derive is based on old", function() {
    assert.equal( 2, twoToTen.from )
    assert.equal( 10, twoToTen.to )
    assert.equal( Period, twoToTen.constructor )
  })

})





