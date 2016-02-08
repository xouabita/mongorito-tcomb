test      = require 'ava'
Mongorito = require './src/index.coffee'
t         = require 'tcomb-validation'

class Test extends Mongorito.Model

  Schema: t.struct
    mandatory: t.String
    optional: t.maybe t.Number

module.exports = ->

  test.before -> yield Mongorito.connect 'localhost/mongorito-tcomb-tests'
  test.after -> yield Mongorito.disconnect()
  test.beforeEach -> yield Test.remove()
  test.afterEach -> yield Test.remove()

  test 'Save valid data', (t) ->
    a = new Test mandatory: 'a'
    try
      yield a.save()
    catch
      t.fail()
    t.pass()

  test 'Throw on error', (t) ->
    a = new Test optional: 56
    try
      yield a.save()
    catch
      t.pass()

  test 'Retrieve a document and modify it', (t) ->
    yield (new Test mandatory: 'a').save()
    a = yield Test.where('mandatory', 'a').findOne()
    a.set 'optional', 78
    try
      yield a.save()
    catch
      t.fail()
    t.pass()

  test 'Retrieve a document and it is not validated', (t) ->
    yield (new Test mandatory: 'a').save()
    a = yield Test.where('mandatory').equals('a').findOne()
    a.unset 'mandatory'
    try
      yield a.save()
    catch
      t.pass()
