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

	var periodValue = vo.valueObjectApplicator("from","to");
	Period = function() {
		periodValue.initialize(this,arguments);
	};
	periodValue.defineFields(Period);

It offers three ways to use value objects. The first is simple - setting field values and then applying read only accessors. The second defines a simple constructor. The third creates a periodValue object that can apply fields to a prototype and validate arguments.

The first and third give you a way of maintaining nice names in debugging tools - the third is better suited when you're creating lots of the objects as we're changing the prototype once rather than adding fields in the constructor.

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

	
