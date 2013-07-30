;(function() {
"use strict";

var vo = {}
var p

var memoizedRecursion = false
vo.memoizedConstructor = function(constructor,params,hasher) {
  if(memoizedRecursion) return false
  var key = hasher ? hasher.apply(null,params) : p.defaultHasher.apply(null,params)
  var stored = p.findInstance(constructor,key)
  if(stored) return stored
  memoizedRecursion = true
  var created = p.applyConstructor(constructor,params)
  p.storeInstance(constructor,key,created)
  memoizedRecursion = false
  return created
}

vo.set = function(instance) {
  var fields = [].slice.call(arguments,1,arguments.length - 1)
  var args = [].slice.call(arguments[arguments.length - 1])
  p.validateFields(fields,args)
  p.defineFields(instance,fields,args)
}

vo.define = function() {
  var fields = [].slice.call(arguments)
  return function constructor() {
    var existing = vo.memoizedConstructor(constructor,arguments)
    if(existing) return existing
    vo.set.apply(null,[this].concat( fields ).concat( [arguments] ))
  }
}

p = vo["-private"] = {
  applyConstructor: function(constructor,params) {
    var ValueObject = function() {}
    ValueObject.prototype = constructor.prototype
    var instance = new ValueObject()
    var retVal = constructor.apply(instance,params)
    return typeof retVal === "object" ? retVal : instance
  },
  memoizedStore: typeof WeakMap == "undefined" ? {} : new WeakMap,
  assert: function(test,msg) {
    if(!test) throw new Error(msg)
  },
  defaultHasher: function() {
    return JSON.stringify([].slice.call(arguments))
  },
  findConstructorInstances: function(constructor) {
    return p.memoizedStore[constructor] || (p.memoizedStore[constructor] = {})
  },
  findInstance: function(constructor,key) {
    return p.findConstructorInstances(constructor)[key]
  },
  storeInstance: function(constructor,key,instance) {
    return p.findConstructorInstances(constructor)[key] = instance
  },
  defineFields: function(instance,fields,args) {
    var descriptors = fields.reduce(function(set,field,index) {
      set[field] = { value: args[index], writable: false }
      return set
    },{})
    descriptors.derive = {
      writable: false,
      enumerable: false,
      value: p.deriver(fields)
    }
    Object.defineProperties(instance,descriptors)
  },
  validateFields: function(fields,args) {
    p.assert(args.length === fields.length,"Wrong number of fields, expected " + fields.length + " got " + args.length);
    var missing = args.reduce(function(missingFields,arg,index) {
      return arg === undefined ? missingFields.concat(fields[index]) : missingFields;
    },[])
    p.assert(missing.length === 0,"Missing fields: " + missing.join(", "))
  },
  deriver: function(fields) {
    return function(attrs) {
      var update = fields.map(function(field) {
        return attrs[field] == null ? this[field] : attrs[field]
      },this)
      return p.applyConstructor(this.constructor,update)
    }
  }
}


if(typeof module != "undefined") {
  module.exports = vo
}
if(typeof define != "undefined") {
  define("values",vo)
} else if(typeof window != "undefined") {
  window.vo = vo
}

})();
