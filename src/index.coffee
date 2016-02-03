t = require 'tcomb-validation'

# Simple function to patch a Mongorito.Model
patch = (Model) ->
  class Son extends Model

    # Add a simple hook when saving which will validate the data
    configure: ->
      super() # Don't forget to run config of the Mother
      @before 'save', 'validate'

    validate: ->

      # If no Schema defined, then we go to the next middleware
      if @Schema is undefined or null then return

      # If the schema is not a Struct, then we raise an error
      if @Schema.meta.kind isnt 'struct'
        throw new Error 'The Schema need to be of kind Struct'

      # Validate props with the Schema
      val = t.validate @attributes, @Schema
      if val.isValid() then return
      else throw val.errors

      yield return

  return Son
