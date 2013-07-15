ValueObject = (name,fields...) ->

  fieldNames = fields.reduce ((all,k) -> all[k] = 1; all), {}
  validate = (vals) ->
    assert vals.length == fields.length, "Wrong number of vals"

  constructor = ->
    validate(arguments)
    fields.forEach (k,i) =>
      this[fields[i]] = arguments[i]
    this

  constructor.name = name

  constructor.prototype =
    constructor: constructor
    derive: (obj) ->
      _.each(obj,(v,k) ->
        assert fieldNames[k], "Invalid field #{k}"
      )
      vals = _.map fields, (k) =>
        obj[k] ? this[k]

      applyConstructor(this.constructor,vals)

  applyConstructor = (originalConstructor,vals) ->
    valuesConstructor = (vals) ->
      originalConstructor.apply(this,vals)
    valuesConstructor.prototype = constructor.prototype
    new valuesConstructor(vals)

  constructor.with = (obj) ->
    _.each(obj,(v,k) ->
      assert fieldNames[k], "Invalid field #{k}"
    )
    vals = _.map fields, (k) ->
      val = obj[k]
      assert val?, "No value for #{k}"
      val
    applyConstructor(constructor,vals)

  constructor