# Values.js

ValueObjects are immutable and identified by value, not identity. Like numbers, it doesn't make sense to 'change' (mutate) a value, you simply have a new one.

```javascript
		var a = 1
		a.set(2)
```

The above is equally true for: intervals, date ranges, sets of any type.

values.js is a small library for making value objects easily. It has fairly simple goals: ensuring the fields are present, and that the fields when set cannot be changed.

Values should be comparable by value. `valueOf` is Javascript's way to do this, but unfortunately it doesn't work for `==` and `===`, only the inquality operators. Equality operations for objects are always based on identity. Values.js works around this by ensuring the same object is returned for the same arguments to a value object constructor.

```javascript
  var oneToTen = new Range(1,10);
  var naturalNumbersUnderEleven = new Range(1,10)

  assert( oneToTen === naturalNumbersUnderEleven );
```

Rather than requiring you to use a subclassing mechanism, Values.js exposes the internals to use. `vo.memoizedConstructor` is used fulfil the value equality semantics; `vo.set` sets the field values immutably; `vo.createPrototype()` creates a prototype object for VOs, or to mix in VO behaviour.

```javascript
	var Period = function Period() {
    var existing = vo.memoizedConstructor(Period,arguments);
    if(existing) return existing;
    vo.set(this,"from","to",arguments);
	};

  Period.prototype = vo.createPrototype();
```

A quick way to define VOs which don't require custom behaviour (effectively just doing the above) is also provided.

```javascript
  var QuickPeriod = vo.define("Period","from","to");
```

To create a new version of a value object based on an old one, use the `derive` method. This eases the creation of modified value objects, without losing the benfits of their immutability.

```javascript
	var periodA = Period(2012,2015);
	var periodB = vo.derive(periodA,{from:2013});

	assert(periodA.from === 2012);
	assert(periodB.from === 2013);

	var periodC = deriveFields(periodA,{from: 2012});

  assert(periodA === periodC);
```

The derive method takes position arguments, or a hash of named arguments. 

## Philosophy

- Light-weight
- Contracts upheld strongly in all ES5 environments
- immutability assures application level validity, so your unit tests will catch any probs in es5/6, even if some browsers will run without immutability
	
## Other ideas

- WeakMap for constructor caching and ===, Map/obj with manual limits on objects cached for older browsers
- .eql .equal .isEqual
