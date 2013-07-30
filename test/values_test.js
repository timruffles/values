var Period, oneToTen, naturalNumbersUnderEleven, twoToTen, QuickPeriod

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

    QuickPeriod = vo.define("from","to")
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

  test("has quick definition", function() {
    var oneToTen = new QuickPeriod(1,10)
    assert.equal( 1, oneToTen.from )
    assert.equal( 10, oneToTen.to )

    var twoToTen = oneToTen.derive({from: 2})
    assert.equal( 2, twoToTen.from )
    assert.equal( 10, twoToTen.to )
    assert.equal( QuickPeriod, twoToTen.constructor )
  })


})

suite("Documentation",function() {
  test("problem definition works", function() {
    function Point(x,y) {
      this.x = x;
      this.y = y;
    }
    var a = new Point(0,0)
    var b = new Point(0,0)

    assert.equal( false, a == b )
  })

  test("solution example works", function() {
    var Point = vo.define("x","y");
    var a = new Point(0,0)
    var b = new Point(0,0)

    assert( a == b )
  })
})





