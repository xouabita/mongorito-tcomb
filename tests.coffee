test      = require 'ava'
Mongorito = { t, Model } = require './lib/index.js'

class Test extends Model

  Schema: t.struct
    mandatory: t.String
    optional: t.maybe t.Number

class User extends Model

  Schema: t.struct
    name: t.unique t.String
    age: t.maybe t.Number

class Post extends Model

  Schema: t.struct
    title: t.String
    content: t.String
    user: t.ID User

module.exports = ->

  test.before -> yield Mongorito.connect 'localhost/mongorito-tcomb-tests'
  test.after  -> yield Mongorito.disconnect()

  test.beforeEach -> yield [Test.remove(), User.remove(), Post.remove()]
  test.afterEach  -> yield [Test.remove(), Post.remove()]

  test 'Save valid data', (t) ->
    a = new Test mandatory: 'a'
    yield a.save()
    t.pass()

  test 'Throw on error', (t) ->
    a = new Test optional: 56
    try
      yield a.save()
    catch
      return
    t.fail()

  test 'Retrieve a document and modify it', (t) ->
    yield (new Test mandatory: 'a').save()
    a = yield Test.where('mandatory', 'a').findOne()
    a.set 'optional', 78
    yield a.save()

  test 'Retrieve a document and it is not validated', (t) ->
    yield (new Test mandatory: 'a').save()
    a = yield Test.where('mandatory').equals('a').findOne()
    a.unset 'mandatory'
    try
      yield a.save()
    catch
      return
    t.fail()

  test 'Save a Model without Schema', (t) ->
    class NoSchema extends Mongorito.Model
    warnCall = no
    console.warn = -> warnCall = yes
    yield (new NoSchema foo: 'bar').save()
    t.fail() if not warnCall

  test 'Save a Model with invalid Schema should throw', (t) ->
    class Invalid extends Mongorito.Model
      Schema: 'invalid'
    try
      yield (new Invalid foo: 'bar').save()
    catch
      return
    t.fail()

  test 'Model with unique attributes should be... unique', (t) ->
    yield (new User name: 'xouabita').save()
    try
      yield (new User name: 'xouabita').save()
    catch
      return
    t.fail()
