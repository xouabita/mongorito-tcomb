require 'colors'
t = require 'tcomb-validation'
getPathForType = require './get_path_for_type'
extractLists   = require './extract_lists'
co = require 'co'

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

      if @haveSchema then @ids = getPathForType @Schema, 'ID'

      # Call parent constructor
      super args...

    # Add a simple hook when saving which will validate the data
    configure: ->
      super() # Don't forget to run config of the Mother
      if not @Schema then return
      @before 'save', 'validate'
      @before 'save', 'ensureUnique'

    validateIDs: co.wrap ->
      ids = extractLists @attributes, @ids

      for {path, type} in ids
        id = @get path
        if id and not (yield type.meta.Model.findById "#{id}")
          throw new Error "#{path} have not a valid id"

    ensureUnique: co.wrap ->
      uniques = getPathForType @Schema, 'unique'

      yield @constructor.index path, unique: yes for {path, type} in uniques

      # Delete this hook
      for hook, i in @_hooks.before.save
        if hook is @ensureUnique
          delete @_hooks.before.save[i]
          break

    validate: co.wrap ->

      val = t.validate @get(), @Schema
      throw val.errors if not val.isValid()

      yield @validateIDs()

  return Son

# Add new tcomb types

unique = (Type) ->
  t.refinement Type, (-> yes), 'unique'

regexID = /^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i
ID      = (Model) ->
  ref = t.refinement t.String, (str) ->
    return no unless regexID.test str
    return yes
  , "ID"
  ref.meta.Model = Model
  return ref

Mongorito          = require 'mongorito'
Mongorito.Model    = patch Mongorito.Model
Mongorito.patch    = patch
Mongorito.t        = require 'tcomb'
Mongorito.t.unique = unique
Mongorito.t.ID     = ID

module.exports = Mongorito
