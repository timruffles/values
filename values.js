;(function() {

"use strict";

const vo = {}
const p = vo.p = {
	applyConstructor: function(constructor,params) {
		const Temp = function() {}
		Temp.prototype = constructor.prototype
		const instance = new Temp()
		const retVal = constructor.apply(instance,params)
		return typeof retVal === "object" ? retVal : instance
	},
  memoizedStore: typeof WeakMap == "undefined" ? {} : new WeakMap,
	assert: function(test,msg) {
		if(!test) throw new Error(msg)
	}
}


let memorizeRecursion = false
vo.memoizedConstructor = function(constructor,params) {
  if(memorizeRecursion) return false
  const key = JSON.stringify([].slice.call(params))
  const stored = vo.findInstance(constructor,key)
  if(stored) return stored
  memorizeRecursion = true
  const created = p.applyConstructor(constructor,params)
  vo.storeInstance(constructor,key,created)
  memorizeRecursion = false
  return created
}

vo.findConstructorInstances = function(constructor) {
  return p.memoizedStore[constructor] || (p.memoizedStore[constructor] = {})
}

vo.findInstance = function(constructor,key) {
  return vo.findConstructorInstances(constructor)[key]
}

vo.storeInstance = function(constructor,key,instance) {
  return vo.findConstructorInstances(constructor)[key] = instance
}

vo.set = function(instance) {
  const fields = [].slice.call(arguments,1,arguments.length - 1)
  const args = [].slice.call(arguments[arguments.length - 1])
  vo.validateFields(fields,args)
  vo.defineFields(instance,fields,args)
}

vo.validateFields = function(fields,args) {
  p.assert(args.length === fields.length,"Missing fields: " + fields.join(", "))
  const missing = args.reduce(function(missingFields,arg,index) {
    return arg === undefined ? missingFields.concat(fields[index]) : missingFields;
  },[])
  p.assert(missing.length === 0,"Missing fields: " + missing.join(", "))
}

vo.defineFields = function(instance,fields,args) {
  const descriptors = fields.reduce(function(set,field,index) {
    set[field] = { value: args[index], writable: false }
    return set
  },{})
  descriptors.derive = {
    writable: false,
    enumerable: false,
    value: vo.deriver(fields)
  }
  Object.defineProperties(instance,descriptors)
}

vo.deriver = function(fields) {
  return function(attrs) {
    const update = fields.map(function(field) {
      return attrs[field] == null ? this[field] : attrs[field]
    },this)
    return p.applyConstructor(this.constructor,update)
  }
}

if(typeof module != "undefined") {
  module.exports = vo
}

})();
