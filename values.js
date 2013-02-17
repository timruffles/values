;(function(undefined) {

var values = {

	valueObject: function(object) {
		var fields = slicer(arguments,1,arguments.length - 1);
		var args = arguments[arguments.length - 1];
		var applicator = apply(values.valueObjectApplicator,null,fields);
		applicator.defineFields({prototype: object},fields);
		applicator.initialize(object,args);
	},
	valueObjectConstructor: function() {
		// TODO - arg define fields needs to have access to the original values!!!
		// therefore need to define a __values on each object
		// -   or   -
		// use defineProperty with just a value
		// -   or   -
		// use Object.freeze
		var fields = slicer(arguments);
		var potentialInitializer = fields[fields.length - 1];
		var initializer = noop;
		if(typeof potentialInitializer === "function") {
			initializer = potentialInitializer;
			fields = fields.slice(0,fields.length - 2);
		};
		var constructor = function() {
			values._validateFields(slicer(arguments),fields);
			return initializer.call(this);
		};
		values._defineFields(constructor.prototype,fields);

		return constructor;
	},
	valueObjectApplicator: function() {
		var fields = slicer(arguments);
		return {
			defineFields: function(type) {
				values._defineFields(type.prototype,fields);
			},
			initialize: function(obj,vals) {
				values._validateFields(vals,fields);
				try {
					values._implementionSetLock = false;
					each(fields,function(field,index) {
						obj[field] = vals[index];
					});
				} finally {
					values._implementionSetLock = true;
				}
			}
		};
	},
	revised: function(obj,revision) {
		var revisedFields = keys(revision);
		each(obj,function(val,field) {
			values._assert(obj[field] !== undefined,"ValueObject does not have field " + field);
			values._assert(val !== undefined,"ValueObject fields must be defined");
		});

		var fields = values._getFields(obj);
		var newArgs = map(fields,function(field) {
			return revision[field] === undefined ? obj[field] : revision[field];
		});
		return values._applyConstructor(obj.constructor,newArgs);
	},

	_applyConstructor: function(constructor,params) {
		var temp = function() {};
		temp.prototype = constructor.prototype;
		var instance = new temp;
		var retVal = constructor.apply(instance,params);
		return typeof retVal === "object" ? retVal : instance
	},
	_assert: function(test,msg) {
		if(!test) return values._error(msg);
	},
	_getFields: function(obj) {
		return obj.__fields;
	},
	_error: function(msg) {
		throw new Error(msg);
	},
	_defineFields: function(obj,fields) {
		values._tagFields(obj,fields);
		each(fields,function(field) { values._defineField(obj,field); });
	},
	_tagFields: function(obj,fields) {
		values._defineProperty(obj,"__fields",{
			enumerable: false,
			value: fields
		});
	},
	_defineProperty: function(obj,prop,descriptor) {
		return Object.defineProperty(obj,prop,descriptor);
	},
	_defineField: function(obj,field) {
		var implementation;
		if(Object.defineProperty) {
			implementation = values._defineFieldES5;
		} else if(Object.__defineGetter__) {
			implementation = values._defineFieldOldMoz;
		} else {
			implementation = values._defineFieldNoop;
		}
		values._defineField = implementation;
		return implementation(obj,field);
	},
	_defineFieldES5: function(obj,field) {
		var fieldValue;
		Object.defineProperty(obj,field,{
			enumerable: true,
			set: function(value) {
				values._assert(values._implementionSetLock === false,"Can't change " + field + " on Immutable ValueObject");
				fieldValue = value;
			},
			get: function() { return fieldValue }
		});
	},
	_defineFieldOldMozilla: function(type,field) {
	},
	_defineFieldNoop: noop,
	_implementionSetLock: true,
	_validateFields: function(args,fields) {
		values._assert(args.length === fields.length,"Missing fields: " + fields.slice(0,fields.length).join(", "));
		var missing = reduce(args,function(missingFields,arg,index) {
			return arg === undefined ? missingFields.push(fields[index]) : missingFields;
		},[]);
		values._assert(missing.length === 0,"Missing fields: " + missing.join(", "));
	}
};

var each = function(arr,fn,ctx) {
	if(!arr.length) return eachObj(arr,fn,ctx);
	for(var i = 0, len = arr.length; i < len; i++) fn.call(ctx,arr[i],i,arr);
};
var eachObj = function(obj,fn,ctx) {
	if(!obj) return;
	for(var prop in obj) {
		if(hasOwnProperty(obj,prop)) fn.call(ctx,obj[prop],prop,obj);
	};
};
var reduce = function(arr,fn,initial,ctx) {
	if(initial === undefined) {
	 	initial = arr[0];
		arr = arr.slice(1);
	}
	memo = initial;
	each(arr,function(member,index) {
		memo = fn.call(ctx,memo,member,index,arr);
	});
	return memo;
};
var map = function(arr,fn,ctx) {
	return reduce(arr,function(all,val,index) {
		return all.concat([ fn.call(ctx,val,index,arr) ]);
	},[]);
};
var zip = function(arrA,arrB) {
	return reduce(arrA,function(zipped,val,index) {
		return zipped.concat([ [val,arrB[index]] ]);
	},[]);
};
var slicer = function(args,from,n) {
	return [].slice.call(args, typeof from === "number" ? from : 0, n);
};
var noop = function() {};
var apply = function(fn,ctx,args) {
	return fn.apply(ctx,args);
};
var keys = function(obj) {
	return map(obj,function(v,k) { return k; });
};
var hasOwnProperty = function(obj,prop) {
	return obj.hasOwnProperty(prop);
};


if(typeof module !== "undefined") {
	module.exports = values;
} else if(typeof define === "function") {
	define(values);
} else {
	window.vo = values;
};


})();
