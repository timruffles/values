# Values

Values is a library for improving your application code by adding value semantics. Lots of concepts in our apps don't have a specific 'identity' - for instance every `new Point({x: 0, y: 0})` is conceptually the same point. It's more natural if these concepts uphold these value semantics in our code, namely that ["two value objects are equal if all their fields are equal"](http://martinfowler.com/bliki/ValueObject.html). But by default in Javascript object equality is based on identity, so:

```javascript

function Point(x,y) {
  this.x = x;
  this.y = y;
}

var a = new Point(0,0);
var b = new Point(0,0);

assert( a == b ); // fails - based on object identity
```

In contrast, Values ensures that we can compare two value objects based on their value:

```javascript
var Point = vo.define("x","y");
var a = new Point(0,0);
var b = new Point(0,0);

assert( a == b ); // succeeds - follows value semantics
```

## Value semantics

So values should be comparable by value. `valueOf` is the method JS gives us to control how our objects are compared, but unfortunately it doesn't work for `==` and `===`, only the inequality operators. Equality operations for objects are always based on identity. Values.js works around this by ensuring the same object is returned for the same arguments to a value object constructor.

```javascript
var a = new Range(1,10);
var b = new Range(1,10);

assert( a === b );
```

If your value object can meaningfully use the inequality operators `<`, `>` - for instance a set can be bigger than another set - then define a `valueOf` method to return a comparable value (a String or Number). That'll cover all comparisons for your value object!


```javascript
var Line = vo.define("x1","y1","x2","y2");
Line.prototype.valueOf = function() {
  // Pythagorus' theorem
  return Math.sqrt( Math.pow(this.y2 - this.y1,2) + Math.pow(this.x2 - this.x1,2) );
}

var a = new Line(0, 0,   0, 10);
var b = new Line(19,19,  20,20);

assert( a > b );
```

## Immutability

ValueObjects [should be immutable](http://c2.com/cgi/wiki?ValueObjectsShouldBeImmutable). Like numbers, it doesn't make sense to 'change' (mutate) a value, you simply have a new one. Allowing values to change in place leads to confusing semantics:

```javascript
var today = MutableDateLibrary.today();
var event = { at: today, text: "started using values" };

// `addDays()` is implemented mutably, changing the date in place and returning it
var remindAt = event.at.addDays(1);

// fails! today has been changed
assert( today.timestamp() === MutableDateLibrary.today().timestamp() );
```

This [really happens](http://arshaw.com/xdate/#Adding), and we've probably all made something that should be a value type mutable. The above is equally true for: intervals, ranges, dates and sets of any type.

Value objects created by Values are immutable - you can't change fields in ES5, and trying to do so in strict mode will raise an exception. If your unit tests enforce immutable use of your value objects, your application will be correct even in non ES5 environments.

## Mixin

Rather than requiring you to use a subclassing mechanism, Values.js exposes functions that allow you to compose your own value objects and setup their constructor and prototype as usual. `vo.memoizedConstructor` is used fulfil the value equality semantics and `vo.setup` sets the field values immutably, also adding the [`derive`](#voderive) non-enumerable method.

```javascript
var Period = function() {
  var existing = vo.memoizedConstructor(Period,this,arguments);
  if(existing) return existing;
  vo.setup(this,periodFields,arguments);
};
var periodFields = ["from","to"];
```

For IE <= 8 support, if you want `derive` you'll need to add it to the prototype. In newer browsers, it's added as a non-enumerable (e.g doesn't appear in `for .. in` loops) property in `setup`:

```
Period.prototype.derive = vo.deriver(periodFields)
```

## Quick definition

A quick way to define VOs which don't require custom constructors (effectively just doing the above) is also provided.

```javascript
var Period = vo.define("from","to");
```


## 'Changing' a value via `derive`

<a id="derive"></a>

To create a new version of a value object based on an old one, use the `derive` method. This eases the creation of modified value objects, without losing the benefits of their immutability.

```javascript
var periodA = new Period(2012,2015);
var periodB = periodA.derive({from:2013});

assert(periodA.from === 2012);
assert(periodB.from === 2013);

var periodC = periodB.derive({from: 2012});

assert(periodA === periodC);
```

The derive method takes a map of named arguments.

You'd use the `derive` method to update references to values in variables or as object properties. Values are used in mutable systems, they're just immutable themselves.

## API

### vo.memoizedConstructor

```javascript
vo.memoizedConstructor(constructor,instance,params [, parameterHasher] )
```

If a value object of same type with the same fields exists, returns that value object. If not, will create and return a new instance. 

You can supply a function as an optional third argument to specify how the parameters are hashed. This is useful if your value objects have fields that can be more quickly hashed than via JSON.stringify (the default hasher).

### vo.setup

```javascript
vo.setup(instance,fields,fieldValues)
```

Sets immutable fields on instance. Also adds the `derive` method as a non-enumerable property.

### vo.define

```
vo.define(fieldName1 [, fieldNameN ... ])
```

Defines a new value object constructor with the specified field names.

### vo#derive

```javascript
aValueObject.derive(newValuesMap)
```

Instance method that returns a new value object with field values taken by preference from newValuesMap, with any missing fields taken from the existing value object `derive` is called on.

## Philosophy

- Small
- Contracts upheld strongly in all ES5 environments (with strict mode)
- Immutability is about ensuring application level validity, so your unit tests will catch any problems when run in ES5/6. If you have good coverage, it doesn't matter if older browsers (IE7) won't enforce immutability at run-time.
