var ValueObject = (function() {

	function ValueObject() {
	  this["-keys"] = [].slice.call(arguments)
	}

	var deriveLock = false

  ValueObject.createPrototype = function(constructor) {
    var tmp = function() {}
    tmp.prototype = ValueObject.prototype
    var proto = new tmp
    proto["-keys"] = [].slice.call(arguments,1) 
    proto.constructor = constructor 
    return proto
  }

	ValueObject.prototype = {
	  eql: function(to) {
	    if(!to || !(typeof to.get == "function")) return false
      // not the same type of value object: e.g MsgParticants{from,to} != Period{from,to}
      if(this.constructor !== to.constructor) return false
	    return _.every(this["-keys"],function(key) {
	      var v1 = this.get(key)
	      var v2 = to.get(key)
	      return typeof v1.eql == "function" ? v1.eql(v2) : v1 === v2
	    },this)
	  },
	  set: function(attrs) {
	    throw new ValueObjectError(this.constructor.name + " is a value object - it can't be changed. Instead, use derive() to base a new value on this one")
	  },
	  check: function(vals) {
	    if(deriveLock) return
      assert(vals.length === this["-keys"].length,
          "Wrong number of fields, " + this.constructor.name + " expected " + this["-keys"].length + " got " + vals.length)
      var missing = _.reduce(vals,function(missingFields,arg,index) {
        return arg == null ? missingFields.concat(this["-keys"][index]) : missingFields
      },[])
      assert(missing.length === 0,this.constructor.name + " is missing fields: " + missing.join(", "))
      var attrs = _.reduce(this["-keys"],function(all,key,index) {
        all[key] = vals[index]
        return all;
      },this)
      this.get = getter(attrs,this)
      return attrs;
	  },
	  derive: function(difference) {
	    deriveLock = true
	    var values = _.reduce(this["-keys"],_.bind(function(all,key) {
	      all[key] = difference[key] == null ? this.get(key) : difference[key]
	      return all
	    },this),{})
	    var value = new this.constructor()
	    value.get = getter(values,this)
	    deriveLock = false
	    return value
	  }
	}

  function ValueObjectError(message) {
    this.message = message;
  }
  ValueObjectError.prototype = new Error();
  ValueObjectError.prototype.name = "ValueObjectError"
  ValueObject.Error = ValueObjectError

  function getter(vals,vo) {
    return _.bind(function(k) {
      assert(_.include(vo["-keys"],k),vo.constructor.name + " does not have field '" + k + "'")
      return vals[k]
    },this)
  }
  function assert(test,msg) {
    if(!test) throw new ValueObjectError(msg)
  }

  if(typeof module != "undefined") {
    module.exports = ValueObject
  }
  return ValueObject
})()

