test = require 'ava'
getPathForType = require '../lib/get_path_for_type.js'
tc = require 'tcomb'

module.exports = ->

  test 'It should find all the Number in a struct', (t) ->

    type = tc.struct
      a: tc.Number
      b: tc.String
      c: tc.Number

    paths = getPathForType type, 'Number'

    t.same paths, ['a', 'c']
