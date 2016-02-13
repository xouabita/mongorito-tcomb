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

      if @haveSchema

        # Check if there is unique types
        for k, v in @Schema.meta.props
          @.index k, unique: yes if v.name is 'unique'

    validate: ->

      return if not @haveSchema

      # Validate props with the Schema
      val = t.validate @attributes, @Schema
      throw val.errors if not val.isValid()

      # Check if there is a ID type
      for k, v in @Schema.meta.props
        if v.name is 'ID' and not (yield @.findById (@get k))
          throw new Error "No items associated with this ID in the database"

      yield return

  return Son

# Add new tcomb types

unique = (Type) ->
  t.refinement Type, (-> yes), 'unique'

regexID = /^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i
ID      = t.refinement t.String, ((str) -> regexID.test str), 'ID'

Mongorito          = require 'mongorito'
Mongorito.Model    = patch Mongorito.Model
Mongorito.patch    = patch
Mongorito.t        = require 'tcomb'
Mongorito.t.unique = unique
Mongorito.t.ID     = ID

module.exports = Mongorito
