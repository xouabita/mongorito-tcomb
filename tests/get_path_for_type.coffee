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

  test 'It should work for Maybe', (t) ->

    type = tc.struct
      a: tc.maybe tc.Number
      b: tc.String
      c: tc.Number

    paths = getPathForType type, 'Number'

    t.same paths, ['a', 'c']

  test 'It should work in a nested object', (t) ->

    type = tc.struct
      a: tc.struct
        foo: tc.Number
        bar: tc.maybe tc.String
        lol: tc.struct
          num: tc.Number
          not: tc.String
      b: tc.Number
      c: tc.maybe tc.struct
        num: tc.Number
        not: tc.String
        may: tc.Number

    paths = getPathForType type, 'Number'

    t.same paths, [
      'a.foo'
      'a.lol.num'
      'b'
      'c.num'
      'c.may'
    ]
