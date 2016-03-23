import test from 'ava'
import getPathForType from '../lib/get_path_for_type'
import tc from 'tcomb'

test('It should find all the Number in a struct', (t) => {

  var type = tc.struct({
    a: tc.Number,
    b: tc.String,
    c: tc.Number
  })

  var paths = getPathForType(type, 'Number')

  t.same(paths, [
    { path: 'a', type: tc.Number },
    { path: 'c', type: tc.Number }
  ])
})

test('It should work for Maybe', (t) => {

  var type = tc.struct({
    a: tc.maybe(tc.Number),
    b: tc.String,
    c: tc.Number
  })

  var paths = getPathForType(type, 'Number')

  t.same(paths, [
    { path: 'a', type: tc.Number },
    { path: 'c', type: tc.Number }
  ])
})

test('It should work in a nested object', (t) => {

  var type = tc.struct({
    a: tc.struct({
      foo: tc.Number,
      bar: tc.maybe(tc.String),
      lol: tc.struct({
        num: tc.Number,
        not: tc.String
      })
    }),
    b: tc.Number,
    c: tc.maybe(tc.struct({
      num: tc.Number,
      not: tc.String,
      may: tc.Number
    }))
  })

  var paths = getPathForType(type, 'Number')

  t.same(paths, [
    { path: 'a.foo', type: tc.Number },
    { path: 'a.lol.num', type: tc.Number },
    { path: 'b', type: tc.Number },
    { path: 'c.num', type: tc.Number },
    { path: 'c.may', type: tc.Number }
  ])
})

test('It should work with list of Number', (t) => {

  var type = tc.struct({
    a: tc.list(tc.struct({
      foo: tc.String,
      bar: tc.Number
    }))
  })

  var paths = getPathForType(type, 'Number')

  t.same(paths, [
    { path: 'a.0.bar', type: tc.Number }
  ])
})
