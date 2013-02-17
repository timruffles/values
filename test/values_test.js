buster.testCase("values",{
	"value objects must have all fields": function() {
		var VO = vo.valueObjectConstructor("field");
		assert.exception(function() {
			new VO;
		});
	},
	"value objects' fields are immutable": function() {
		var VO = vo.valueObjectConstructor("field");
		assert.exception(function() {
			var instance = new VO("value");
			instance.field = "new value";
		});
	},
	"revised creates new versions of value objects based on old ones": function() {
		var VO = vo.valueObjectConstructor("field");

		var instance = new VO("value");

		var newValue = "new value";
		var revisedVo = vo.revised(instance,{field: newValue});

		assert.same(newValue,revisedVo.field)
	},
	"revised does not affect old versions": function() {
		var VO = vo.valueObjectConstructor("field");

		var instance = new VO("value");
		var originalValue = instance.field;

		var newValue = "new value";
		var revisedVo = vo.revised(instance,{field: newValue});

		assert.same(originalValue,instance.field);
	},

	"valueObjectConstructor allows use of an initalizer": function() {
		var initSpy = sinon.spy();
		var val = "value";
		var VO = vo.valueObjectConstructor("field",initSpy);

		new VO(val);

		assert.calledOnceWith(initSpy,val);
	},

	"valueObject gives you a way of extending existing constructors": function() {
		var VO = function() {
			vo.valueObject(this,"field",arguments);
		};
		assert.exception(function() {
			new VO;
		});
		assert.exception(function() {
			var instance = new VO("value");
			instance.field = "new value";
		});
		var instance = new VO("value");
		assert.same("value",instance.field);

		var newValue = "new value";
		var newInstance = vo.revised(instance,{field: newValue});
		assert.same("value",instance.field);
		assert.same(newValue,newInstance.field);
	}
});
