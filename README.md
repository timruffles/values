# Values

values is a small library that makes creating immutable ValueObjects with value semantics easy. ValueObjects are defined by value, not identity, and cannot be changed after they're constructed - just like numbers.

In other words, ["two value objects are equal if all their fields are equal"](http://martinfowler.com/bliki/ValueObject.html).

## Value semantics

Values should be comparable by value. `valueOf` is Javascript's way to do this, but unfortunately it doesn't work for `==` and `===`, only the inquality operators. Equality operations for objects are always based on identity. Values.js works around this by ensuring the same object is returned for the same arguments to a value object constructor.

```javascript
var oneToTen = new Range(1,10);
var naturalNumbersUnderEleven = new Range(1,10);

assert( oneToTen === naturalNumbersUnderEleven );
```

## Immutability

ValueObjects are immutable and identified by value, not identity. Like numbers, it doesn't make sense to 'change' (mutate) a value, you simply have a new one. Allowing values to change in place leads to confusing semantics:

```javascript
var today = MutableDateLibrary.today();
var event = { at: today, text: "started using values" };

function eventReminder(event) {
  // `addDays()` is implemented in a mutable fashion
  // changing the date in place and returning it
  var remindAt = event.at.addDays(1);
  setReminder(remindAt);
}

eventReminder(event);

assert( today === MutableDateLibrary.today() );
// fails! tomorrow has changed, mutable values have screwed up our semantics
```

This [really happens](http://arshaw.com/xdate/#Adding), and we've probably all made something that should be a value type mutable. The above is equally true for: intervals, ranges, dates and sets of any type.

## Mixin

Rather than requiring you to use a subclassing mechanism, Values.js exposes the internals to use. `vo.memoizedConstructor` is used fulfil the value equality semantics and `vo.set` sets the field values immutably, also adding the `derive` non-enumerable method.

```javascript
var Period = function Period() {
  var existing = vo.memoizedConstructor(Period,arguments);
  if(existing) return existing;
  vo.set(this,"from","to",arguments);
};

Period.prototype = vo.createPrototype();
```

## Quick definition

A quick way to define VOs which don't require custom behaviour (effectively just doing the above) is also provided.

```javascript
var QuickPeriod = vo.define("Period","from","to");
```

## 'Changing' a value via `derive`

To create a new version of a value object based on an old one, use the `derive` method. This eases the creation of modified value objects, without losing the benfits of their immutability.

```javascript
var periodA = new Period(2012,2015);
var periodB = vo.derive(periodA,{from:2013});

assert(periodA.from === 2012);
assert(periodB.from === 2013);

var periodC = deriveFields(periodA,{from: 2012});

assert(periodA === periodC);
```

The derive method takes a hash of named arguments.

You'd use the `derive` method to update references to values in variables or as object properties. Values are used in mutable systems, they're just immutable themselves.


## Philosophy

- Small
- Contracts upheld strongly in all ES5 environments
- Immutability is about ensuring application level validity, so your unit tests will catch any problems when run in es5/6. If you have good coverage, it doesn't matter if older browsers (IE7) won't enforce immutability themselves.
