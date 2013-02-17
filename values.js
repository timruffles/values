;(function(global,undefined) {
"use strict";

var noop = function() {};

var values = {

	valueObject: function(object,setup) {
		var fields;
		var vals;
		if(setup && setup.fields && setup.values) {
			fields = setup.fields; 
			vals = setup.values;
		} else {
			fields = slicer(arguments,1,arguments.length - 1);
			vals = slicer(arguments[arguments.length - 1]);
		}

		values._validateFields(fields,vals);
		values._defineFields(object,fields,vals);
		values._tagFields(object,fields);
		values._freeze(object);
	},
	valueObjectConstructor: function() {
		var fields = slicer(arguments);
		var initializer = noop;
		var potentialInitializer = fields[fields.length - 1];
		if(typeof potentialInitializer === "function") {
			fields = fields.slice(0,fields.length - 1);
			initializer = potentialInitializer;
		}
		return function() {
			var vals = slicer(arguments);
			values.valueObject(this,{fields: fields, values: vals});
			apply(initializer,this,arguments);
			return this;
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

	_assert: function(test,msg) {
		if(!test) return values._error(msg);
	},
	_getFields: function(obj) {
		return obj.__fields;
	},
	_error: function(msg) {
		throw new Error(msg);
	},
	_freeze: Object.freeze || noop,
	_defineFields: function(obj,fields,vals) {
		each(fields,function(field,index) { values._defineField(obj,field,vals[index]); });
	},
	_applyConstructor: function(constructor,params) {
		var Temp = function() {};
		Temp.prototype = constructor.prototype;
		var instance = new Temp();
		var retVal = constructor.apply(instance,params);
		return typeof retVal === "object" ? retVal : instance;
	},
	_tagFields: function(obj,fields) {
		values._defineField(obj,"__fields",fields);
	},
	_defineField: function(obj,field,val) {
		var implementation;
		if(Object.defineProperty) {
			implementation = values._defineGetterES5;
		} else {
			implementation = values._defineGetterUnprotected;
		}
		values._defineField = implementation;
		return implementation(obj,field,val);
	},
	_defineGetterES5: function(obj,field,val) {
		Object.defineProperty(obj,field,{
			enumerable: true,
			set: function() { throw new Error("Attempt to set field on immutable ValueObject"); },
			get: function() { return val; }
		});
	},
	_defineGetterUnprotected: function(object,field,val) {
		object[field] = val;
	},
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
		if(ownProperty(obj,prop)) fn.call(ctx,obj[prop],prop,obj);
	}
};
var reduce = function(arr,fn,initial,ctx) {
	if(initial === undefined) {
		initial = arr[0];
		arr = arr.slice(1);
	}
	var memo = initial;
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
var slicer = function(args,from,n) {
	return [].slice.call(args, typeof from === "number" ? from : 0, n);
};
var apply = function(fn,ctx,args) {
	switch(args.length) {
		case 0: return fn.call(ctx);
		case 1: return fn.call(ctx,args[0]);
		case 2: return fn.call(ctx,args[0],args[1]);
		case 3: return fn.call(ctx,args[0],args[1],args[2]);
		case 4: return fn.call(ctx,args[0],args[1],args[2],args[3]);
		case 5: return fn.call(ctx,args[0],args[1],args[2],args[3],args[4]);
		case 6: return fn.call(ctx,args[0],args[1],args[2],args[3],args[4],args[5]);
		case 7: return fn.call(ctx,args[0],args[1],args[2],args[3],args[4],args[5],args[6]);
		case 8: return fn.call(ctx,args[0],args[1],args[2],args[3],args[4],args[5],args[6],args[7]);
		case 9: return fn.call(ctx,args[0],args[1],args[2],args[3],args[4],args[5],args[6],args[7],args[8]);
		case 10: return fn.call(ctx,args[0],args[1],args[2],args[3],args[4],args[5],args[6],args[7],args[8],args[9]);
	}
};
var keys = function(obj) {
	return map(obj,function(v,k) { return k; });
};
var objProto = Object.prototype;
var ownProperty = function(obj,prop) {
	return objProto.hasOwnProperty.call(prop);
};


if(typeof module !== "undefined") {
	global.module.exports = values;
} else if(typeof define === "function") {
	define(values);
} else {
	global.vo = values;
}

})(this);
