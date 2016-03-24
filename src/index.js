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
      this.haveShema = Boolean(this.Schema)
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

    async validateIds() {
      var ids = extractLists(this.attributes, this.ids)

      for (var {path, type} in ids) {
        var id = this.get(path)
        if (id && !(await type.meta.Model.findById("" + id)))
          throw new Error(`${path} have not a valid ID`)
      }
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
      var val = t.validate(this.get(), this.Schema)
      if (!val.isValid())
        throw val.errors
      return true// await this.validateIds()
    }
  }

  return Son
}

function unique(Type) {
  return t.refinement(Type, () => true, 'unique')
}

var regexID = /^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i
function ID(Model) {
  let ref = t.refinement(t.String, (str) => {
    if (regexID.test(str))
      return true
    else
      return false
  }, "ID")
  ref.meta.Model = Model

  return ref
}

var Mongorito      = require('mongorito')
Mongorito.Model    = patch(Mongorito.Model)
Mongorito.patch    = patch
Mongorito.t        = require('tcomb')
Mongorito.t.unique = unique
Mongorito.t.ID     = ID

module.exports = Mongorito
