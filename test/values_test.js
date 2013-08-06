var Period, oneToTen, naturalNumbersUnderEleven, twoToTen, QuickPeriod

suite("values", function(){
  beforeEach(function() {
    Period = function() {
      var existing = vo.memoizedConstructor(Period,this,arguments);
      if(existing) return existing;
      vo.setup(this,periodFields,arguments);
    }
    var periodFields = ["from","to"]
    // for old browsers, setup derive as a prototype field
    vo.setupPrototype(Period,periodFields);
    oneToTen = new Period(1,10);
    naturalNumbersUnderEleven = new Period(1,10)
    twoToTen = oneToTen.derive({from: 2})

    QuickPeriod = vo.define("from","to")
  })

  test("derive is defined as a non-enumerable or prototype method in browser with and without Object.defineProprties respectively",function() {
    for(var prop in oneToTen) {
      if(!oneToTen.hasOwnProperty(prop)) continue
      assert.notEqual( "derive", prop, "shouldn't see derive" )
    }
  })

  test("it defines accessors", function() {
    assert.equal( 10, oneToTen.to )
  })
  test("it returns the same instance for a vo of same type with same fields", function() {
    assert( oneToTen === naturalNumbersUnderEleven )
  })
  test("derive doesn't affect existing vo", function() {
    assert.equal( 1, oneToTen.from )
    assert.equal( 10, oneToTen.to )
  })

  test("derive is based on old", function() {
    assert.equal( 2, twoToTen.from )
    assert.equal( 10, twoToTen.to )
  })

  test("custom hasher", function() {
    function HasCustom() {
      var existing = vo.memoizedConstructor(Period,this,arguments,function(a,b) {
        return a + b.id
      });
      if(existing) return existing;
      vo.setup(this,["a","b"],arguments);
    }
    vo.setupPrototype(HasCustom,["a","b"]);

    var a = new HasCustom("foo",{id: 10});
    var b = new HasCustom("foo",{id: 10});

    assert.equal( a, b)
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

  test("caching doesn't confuse constructors", function() {
    var oneToTen = new QuickPeriod(1,10)
    var Type = vo.define("a","b")
    assert.equal( Type, new Type(1,10).constructor )
    assert.equal( QuickPeriod, oneToTen.constructor )
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

  test("inequalities", function() {
    var Line = vo.define("x1","y1","x2","y2");
    Line.prototype.valueOf = function() {
      return Math.sqrt( Math.pow(this.y2 - this.y1,2) + Math.pow(this.x2 - this.x1,2) );
    }

    var a = new Line(0, 0,   0, 10);
    var b = new Line(19,19,  20,20);

    assert( a > b );
    assert.equal( 10, a.valueOf() );
  })
})





