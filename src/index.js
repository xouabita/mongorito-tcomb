"use strict"
require('colors')

var t              = require('tcomb-validation')
var getPathForType = require('./get_path_for_type')
var extractLists   = require('./extract_lists')
var co             = require('co')

function patch(Model) {
  class Son extends Model {
    constructor(...args) {
      super(...args)
      this.haveShemama = Boolean(this.Schema)
      if (!this.haveShema)
        console.warn("[Warning] No Schema!".yellow)
      if (this.haveShema &&
               (!this.Schema.meta || this.Schema.meta.kind !== 'struct'))
        throw new Error('The Schema need to be of kind struct')
      if (this.haveShema)
        this.ids = getPathForType(this.Schema, 'ID')
    }

    configure() {
      super.configure()
      if (!this.Schema)
        return
      this.before('save', 'validate')
      this.before('save', 'ensureUnique')
    }

    async ensureUnique() {
      var uniques = getPathForType(this.Schema, 'unique')
      for (var {path, type} of uniques) {
        await this.constructor.index(path, {unique: true})
      }

      for (var i = 0, len_ = this._hooks.before.save.length; i < len_; i++) {
        var hook = this._hooks.before.save[i]
        if (hook === this.ensureUnique) {
          delete this._hooks.before.save[i]
          break
        }
      }
    }

    async validate() {
      this.asyncValidations = []
      var val = t.validate(this.get(), this.Schema)
      if (!val.isValid())
        throw val.errors

      for (var validator of this.asyncValidations) {
        if (!(await validator()))
          throw new Error(validator.msgError)
      }
    }
  }

  return Son
}

function unique(Type) {
  return t.refinement(Type, () => true, 'unique')
}

var regexID = /^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i
function ID(ctx, Model) {
  return t.refinement(t.String, (str) => {
    if (!regexID.test(str))
      return false
    ctx.asyncValidations.push(async () => {
      const res = await Model.findById('' + str)
      if (!res)
        throw new Error(`${str} is not a valid ID for ${Model.name}`)
      return true
    })
    return true
  }, 'ID')
}

var Mongorito      = require('mongorito')
Mongorito.Model    = patch(Mongorito.Model)
Mongorito.patch    = patch
Mongorito.t        = require('tcomb')
Mongorito.t.unique = unique
Mongorito.t.ID     = ID

module.exports = Mongorito
