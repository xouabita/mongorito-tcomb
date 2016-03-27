"use strict"
import 'colors'
import t from 'tcomb-validation'

function patch(Model) {
  class Son extends Model {
    constructor(...args) {
      super(...args)
      this.haveSchema = Boolean(this.Schema)
      if (!this.haveSchema)
        console.warn("[Warning] No Schema!".yellow)
      if (this.haveSchema &&
               (!this.Schema.meta || this.Schema.meta.kind !== 'struct'))
        throw new Error('The Schema need to be of kind struct')
    }

    configure() {
      super.configure()
      if (!this.Schema)
        return
      this.before('save', 'validate')
    }

    async validate() {
      this.asyncValidations = []
      var val = t.validate(this.get(), this.Schema)
      if (!val.isValid())
        throw val.errors

      for (var validator of this.asyncValidations) {
        await validator()
      }
    }
  }

  return Son
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
Mongorito.t.ID     = ID

module.exports = Mongorito
