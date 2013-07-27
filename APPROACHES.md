- defineProperty
- get/attr wrappers
- proxy

- nothing weird will be acceptable - eg get(vo,field)
- short sweet names
- smaller is better
- probably needs to be fast

- questions: add a `derive` etc prototype ?

strategies.es6 = {
  valueSemantics: function() {
    // WeakMap
  },
};

strategies.es5 = {
  valueSemantics: function() {
    
  }
};

strategies.preEs5 = {

};


- pre maps could simply use sorted set of fields on a VO to lookup proto?
- actually prob with gen constructors will be fine with prototypes
- 
