;(function() {
"use strict"

var vo = {}
var p

var memoizedRecursion = false
vo.memoizedConstructor = function(constructor,instance,params,hasher) {
  if(memoizedRecursion) return false
  var key = hasher ? hasher.apply(null,params) : p.defaultHasher.apply(null,params)
  var stored = p.findInstance(constructor,key)
  if(stored) return stored
  memoizedRecursion = true
  var created = p.runConstructor(constructor,instance,params)
  p.storeInstance(constructor,key,created)
  memoizedRecursion = false
  return created
}


vo.setup = function(instance,fields,args) {
  args = [].slice.call(args)
  p.validateFields(fields,args)
  p.defineFields(instance,fields,args)
}

vo.define = function() {
  var fields = [].slice.call(arguments)
  function ValueObject() {
    var existing = vo.memoizedConstructor(ValueObject,this,arguments)
    if(existing) return existing
    vo.setup.call(null,this,fields,arguments)
  }
  vo.setupPrototype(ValueObject,fields)
  return ValueObject
}

vo.setupPrototype = function(type,fields) {
  type.prototype.fields = fields
  type.prototype.derive = p.derive
}

p = vo["-private"] = {
  derive: function(attrs) {
    var update = p.map(this.fields,function(field) {
      return attrs[field] == null ? this[field] : attrs[field]
    },this)
    return p.applyConstructor(this.constructor,update)
  },
  defineProperties: Object.defineProperties || function(obj,props) {
    for(var prop in props) {
      if(!props.hasOwnProperty(prop)) continue
      if(props[prop].enumerable === false) continue
      obj[prop] = props[prop].value
    }
  },
  reduce: function(arr,fn,initial,ctx) {
    if(initial == null) {
      initial = arr[0]
      arr = arr.slice(1)
    }
    for(var i = 0, l = arr.length; i < l; i++) {
      initial = fn.call(ctx,initial,arr[i],i)
    }
    return initial
  },
  map: function(arr,fn,ctx) {
    return p.reduce(arr,function(all,el,i) {
      all.push(fn.call(ctx,el,i)); return all
    },[],ctx)
  },
  applyConstructor: function(constructor,params) {
    var ValueObject = function() {}
    ValueObject.prototype = constructor.prototype
    var instance = new ValueObject()
    return p.runConstructor(constructor,instance,params)
  },
  runConstructor: function(constructor,instance,params) {
    var retVal = constructor.apply(instance,params)
    return typeof retVal === "object" ? retVal : instance
  },
  WeakMap: typeof WeakMap != "undefined" ? WeakMap : (function() {
    function WeakMapShim() {}
    WeakMapShim.prototype.get = function(k) {
      return this[k]
    }
    WeakMapShim.prototype.set = function(k,v) {
      return this[k] = v
    }
    return WeakMapShim
  })(),
  IdentityMap: (function() {
    function IdentityMap() {
      this.keys = []
      this.vals = []
    }
    IdentityMap.prototype.get = function(k) {
      for(var i = 0, len = this.keys.length; i < len; i++)
        if(this.keys[i] === k) return this.vals[1]
    }
    IdentityMap.prototype.set = function(k,v) {
      this.keys.push(k)
      this.vals.push(v)
    }
    return IdentityMap
  })(),
  ConstructorMap: (function() {
    // fns are stored in maps or objects as their toString, 
    // so we need an additional IdentityMap to differentiate
    // fns with the same toString() representation
    // Map<FunctionAsString,[(Function,Map<Key,Object>)]>
    function ConstructorMap() {
      this.functionStringsToFunction = new p.WeakMap
    }
    ConstructorMap.prototype.get = function(k) {
      var fns = this.functionStringsToFunction.get(k)
      if(!fns) {
        fns = new p.IdentityMap
        this.functionStringsToFunction.set(k,fns)
      } 
      var instances = fns.get(k)
      if(!instances) {
        var instances = new p.WeakMap
        fns.set(k,instances)
      }
      return instances
    }
    return ConstructorMap
  })(),
  assert: function(test,msg) {
    if(!test) throw new Error(msg)
  },
  defaultHasher: function() {
    return JSON.stringify([].slice.call(arguments))
  },
  findConstructorInstances: function(constructor) {
    return p.memoizedStore.get(constructor)
  },
  findInstance: function(constructor,key) {
    return p.findConstructorInstances(constructor).get(key)
  },
  storeInstance: function(constructor,key,instance) {
    return p.findConstructorInstances(constructor).set(key,instance)
  },
  defineFields: function(instance,fields,args) {
    var descriptors = p.reduce(fields,function(set,field,index) {
      set[field] = { value: args[index], writable: false, enumerable: true }
      return set
    },{})
    p.defineProperties(instance,descriptors)
  },
  validateFields: function(fields,args) {
    p.assert(args.length === fields.length,"Wrong number of fields, expected " + fields.length + " got " + args.length)
    var missing = p.reduce(args,function(missingFields,arg,index) {
      return arg === undefined ? missingFields.concat(fields[index]) : missingFields
    },[])
    p.assert(missing.length === 0,"Missing fields: " + missing.join(", "))
  }
}

p.memoizedStore = new p.ConstructorMap()

if(typeof module != "undefined") {
  module.exports = vo
}
if(typeof define != "undefined") {
  define("values",vo)
} else if(typeof window != "undefined") {
  window.vo = vo
}

})();
