global._ = require("underscore");
global.assert = require("assert")
var ValueObject = require("../src/values_backbone.js");

describe("vo.Backbone", function(){

  function Period() {
    this.check(arguments)
  }
  Period.prototype = ValueObject.createPrototype(Period,"from","to")

  function MessageParticipants() {
    this.check(arguments)
  }
  MessageParticipants.prototype = new ValueObject("from","to")
  MessageParticipants.prototype.constructor = MessageParticipants

  _.each(["reusing instances","fresh instances"],function(instanceContext) {

    var reusingInstances = instanceContext === "reusing instances"

    context(", testing " + instanceContext + ",",function() {

      var periodA
      var periodB
      var periodC
      var msgParticipants
      var recursiveVoA
      var recursiveVoB

      (reusingInstances ? before : beforeEach)(function() {
        periodA = new Period(1,10)
        periodB = new Period(1,10)  
        periodC = new Period(2,25)  
        msgParticipants = new MessageParticipants(1,10)
        recursiveVoA = new Period(periodA,periodB)
        recursiveVoB = new Period(periodA,periodB)
      })

      voTests(function() {
        return {
          a: periodA,
          b: periodB,
          c: periodC,
          recursiveVoA: recursiveVoA,
          recursiveVoB: recursiveVoB,
          msgParticipants: msgParticipants
        }
      })

      context("constructing",function() {
        it("ensures all attributes are present",function() {
          assert.throws(function() {
            new Period(1);
          })
        })
        it("ensures all attributes are not undefined",function() {
          assert.throws(function() {
            new Period(undefined,2);
          })
        })
        it("ensures all attributes are not null",function() {
          assert.throws(function() {
            new Period(null,2);
          })
        })
        it("ensures no additional attributes are present",function() {
          assert.throws(function() {
            new Period(1,2,3);
          })
        })
      })

      context("deriving",function() {
        it("has different attrs to new",function() {
          assert.equal(periodA.derive({from: 22}).get("from"),22)
        })
        it("bases old on new",function() {
          assert.equal(periodA.derive({from: 22}).get("to"),10)
        })
        it("not equal to new",function() {
          var derived = periodA.derive({from: 22})
          assert(!periodA.eql(derived))
        })
        voTests(function() {
          return {
            a: periodA.derive({from: 22}).derive({from: 1}),
            b: periodB.derive({from: 22}).derive({from: 1}),
            c: periodC.derive({from: 22}).derive({from: 2}),
            recursiveVoA: recursiveVoA.derive({from: periodC}).derive({from: periodA}),
            recursiveVoB: recursiveVoB.derive({from: periodC}).derive({from: periodA}),
            msgParticipants: msgParticipants.derive({from: 52},{from: 1})
          }
        })
      })

      function voTests(makeVos) {
        var vos
        before(function() {
          vos = makeVos()
        })
        beforeEach(function() {
          if(!reusingInstances) vos = makeVos()
        })
        context("get()",function() {
          it("get() returns attributes",function() {
            assert.equal(vos.a.get("from"),1)
          })
          it("get() throws exception if asked for non-existent attribute",function() {
            assert.throws(function() {
              vos.a.get("somethingNotThere");
            })
          })
        })
        context("set()",function() {
          it("throws exception",function() {
            assert.throws(function() {
              vos.a.set({foo: "bar"})
            })
          })
          it("exception contains name",function() {
            var msg = ""
            try {
              vos.a.set({foo: "bar"})
            } catch(e) {
              if(!(e instanceof ValueObject.Error))
                throw e
              msg = e.message
            }
            assert(/Period/.test(msg))
          })
        })
        context("eql()",function() {
          it("true for two identical value objects",function() {
            assert(vos.a.eql(vos.b))
          })
          it("not true two value objects of same type with different attributes",function() {
            assert(!vos.a.eql(vos.c))
          })
          it("works recursively with value objects (e.g attributes can themselves be vos)",function() {
            assert(vos.recursiveVoA.eql(vos.recursiveVoB))
          })
          it("not true for two different types of value objects with same attributes",function() {
            assert(!vos.a.eql(vos.msgParticipants))
          })
        })
      }

    })

  })

})
