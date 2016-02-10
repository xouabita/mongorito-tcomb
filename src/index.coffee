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

      yield return

  return Son

Mongorito       = require 'mongorito'
Mongorito.Model = patch Mongorito.Model
Mongorito.patch = patch

module.exports = Mongorito
