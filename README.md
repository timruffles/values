# Values.js

ValueObjects are immutable and identified by value, not identity. Like numbers, it doesn't make sense to 'change' (mutate) a value, you simply have a new one.

		var a = 1
		a.set(2)

The above is equally true for: intervals, date ranges, sets of any type.

values.js is a small library for making value objects easily:

	var Period = function(from,to) {
		valueObject(this,"from","to",arguments);
	};

	Period = valueObjectConstructor("from","to",function() {
		// optional additional constructor
	});

It offers two ways to use value objects. The first is simple - setting field values and then applying read only accessors. The second defines a simple constructor.

The second way allows you to maintain nice names in debugging tools.

To create a new version of a value object based on an old one, use the `revised` method - which creates a new object based on the old one.

	var periodA = Period(2012,2015);
	var periodB = revised(periodA,{from:2013});

	assert(periodA.from === 2012);
	assert(periodB.from === 2013);

	var periodC = revisedFields(periodA,{from: 2012});

The revised method takes position arguments, or a hash of named arguments. This eases the creation of modified value objects, without losing the benfits of their immutability.

## Philosophy

- Light-weight
- Contracts upheld strongly in all ES5 environments

	
