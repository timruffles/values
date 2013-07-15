# Values.js

ValueObjects are immutable and identified by value, not identity. Like numbers, it doesn't make sense to 'change' (mutate) a value, you simply have a new one.

		var a = 1
		a.set(2)

The above is equally true for: intervals, date ranges, sets of any type.

values.js is a small library for making value objects easily. It has fairly simple goals: ensuring the fields are present, and that the fields when set cannot be changed.

	var Period = function(from,to) {
		vo.set(this,"from","to",arguments);
	};

	Period = valueObjectConstructor("from","to",function() {
		// optional additional constructor
	});

It offers two ways to use value objects. The first is simple - setting field values and then applying read only accessors. The second defines a simple constructor.

The second way allows you to maintain nice names in debugging tools.

To create a new version of a value object based on an old one, use the `derive` method. This eases the creation of modified value objects, without losing the benfits of their immutability.

	var periodA = Period(2012,2015);
	var periodB = derive(periodA,{from:2013});

	assert(periodA.from === 2012);
	assert(periodB.from === 2013);

	var periodC = deriveFields(periodA,{from: 2012});

The derive method takes position arguments, or a hash of named arguments. 

## Philosophy

- Light-weight
- Contracts upheld strongly in all ES5 environments

	
## Other ideas

- WeakMap for constructor caching and ===, Map/obj with manual limits on objects cached for older browsers
- .eql .equal .isEqual
