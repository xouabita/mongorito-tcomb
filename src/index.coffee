require 'colors'
t = require 'tcomb-validation'

# Simple function to patch a Mongorito.Model
patch = (Model) ->
  class Son extends Model

    constructor: (args...) ->

      # Warning if there is no Schema
      @haveSchema = Boolean @Schema
      console.warn "[Warning] No Schema!".yellow if not @haveSchema

      # Warning if Schema is invalid
      if @haveSchema and (not @Schema.meta or @Schema.meta.kind isnt 'struct')
        throw new Error 'The Schema need to be of kind Struct'

      # Call parent constructor
      super args...

    # Add a simple hook when saving which will validate the data
    configure: ->
      super() # Don't forget to run config of the Mother
      @before 'save', 'validate'

    validate: ->

      return if not @haveSchema

      # Validate props with the Schema
      val = t.validate @attributes, @Schema
      throw val.errors if not val.isValid()

      for k, v of @Schema.meta.props
        yield @constructor.index k, unique: yes if v.meta.name is 'unique'

      yield return

  return Son

# Add new tcomb types

unique = (Type) ->
  t.refinement Type, (-> yes), 'unique'

regexID = /^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i
ID      = (Model) ->
  t.refinement t.String, (str) ->
    return no unless regexID.test str
    return no unless (yield Model.findById str)
    return yes

Mongorito          = require 'mongorito'
Mongorito.Model    = patch Mongorito.Model
Mongorito.patch    = patch
Mongorito.t        = require 'tcomb'
Mongorito.t.unique = unique
Mongorito.t.ID     = ID

module.exports = Mongorito
