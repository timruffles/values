# Values

values is a small library that makes creating immutable ValueObjects with value semantics easy. ValueObjects are defined by value, not identity, and cannot be changed after they're constructed.

Just as you can't conceptually have multiple distinct 'instances' of a number, you don't have multiple instances of a value object with a given set of field values.

In other words, ["two value objects are equal if all their fields are equal"](http://martinfowler.com/bliki/ValueObject.html).

## Value semantics


So values should be comparable by value. `valueOf` is Javascript's way to do this, but unfortunately it doesn't work for `==` and `===`, only the inquality operators. Equality operations for objects are always based on identity. Values.js works around this by ensuring the same object is returned for the same arguments to a value object constructor.

```javascript
var oneToTen = new Range(1,10);
var naturalNumbersUnderEleven = new Range(1,10);

assert( oneToTen === naturalNumbersUnderEleven );
```

## Immutability

ValueObjects [should be immutable](http://c2.com/cgi/wiki?ValueObjectsShouldBeImmutable). Like numbers, it doesn't make sense to 'change' (mutate) a value, you simply have a new one. Allowing values to change in place leads to confusing semantics:

```javascript
var today = MutableDateLibrary.today();
var event = { at: today, text: "started using values" };

// `addDays()` is implemented in a mutable fashion
// changing the date in place and returning it
var remindAt = event.at.addDays(1);

assert( today === MutableDateLibrary.today() );
// fails! today has been changed in place, mutable values 
// have screwed up our semantics
```

This [really happens](http://arshaw.com/xdate/#Adding), and we've probably all made something that should be a value type mutable. The above is equally true for: intervals, ranges, dates and sets of any type.

## Mixin

Rather than requiring you to use a subclassing mechanism, Values.js exposes functions that allow you to compose your own value objects. `vo.memoizedConstructor` is used fulfil the value equality semantics and `vo.set` sets the field values immutably, also adding the [`derive`](#derive) non-enumerable method.

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
var Period = vo.define("from","to");
```

## 'Changing' a value via `derive`

<a id="derive"></a>

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

## API

### vo.memoizedConstructor

```javascript
vo.memoizedConstructor(constructor,params)
```

If a value object of same type with the same fields exists, returns that value object. If not, will create and return a new instance. 

### vo.set

```javascript
vo.set(instance,fields,fieldValues)
```

Sets immutable fields on instance. Also adds the `derive` method as a non-enumerable property.

### vo.define

```
vo.define(field1,field2,field3)
```

Defines a new value object contru

### vo#derive

```javascript
aValueObject.derive(newValuesMap)
```

Returns a new value object with field values taken from newValuesMap, and any fields missing from newValuesMap taken from the existing value object `derive` is called on.

## Philosophy

- Small
- Contracts upheld strongly in all ES5 environments
- Immutability is about ensuring application level validity, so your unit tests will catch any problems when run in es5/6. If you have good coverage, it doesn't matter if older browsers (IE7) won't enforce immutability themselves.
