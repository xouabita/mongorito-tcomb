test      = require 'ava'
Mongorito = { t, Model } = require '../lib/index.js'

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

class MaybeID extends Model

  Schema: t.struct
    maybe: t.maybe t.ID User

class ListID extends Model

  Schema: t.struct
    users: t.list t.ID User

class NestedList extends Model

  Schema: t.struct
    comments: t.list t.struct
      content: t.String
      likes: t.list t.ID User

removeAll = ->
  yield [
    Test.remove()
    User.remove()
    Post.remove()
    MaybeID.remove()
    ListID.remove()
    NestedList.remove()
  ]


  try yield [
    Test._collection().dropIndexes()
    User._collection().dropIndexes()
    Post._collection().dropIndexes()
    MaybeID._collection().dropIndexes()
    ListID._collection().dropIndexes()
    NestedList._collection().dropIndexes()
  ]

module.exports = ->

  test.before -> yield Mongorito.connect 'localhost/mongorito-tcomb-tests'
  test.after  -> yield Mongorito.disconnect()

  test.beforeEach -> yield removeAll()
  test.afterEach  -> yield removeAll()

  test.serial 'Save valid data', (t) ->
    a = new Test mandatory: 'a'
    yield a.save()
    t.pass()

  test.serial 'Throw on error', (t) ->
    a = new Test optional: 56
    try
      yield a.save()
    catch
      return
    t.fail()

  test.serial 'Retrieve a document and modify it', (t) ->
    yield (new Test mandatory: 'a').save()
    a = yield Test.where('mandatory', 'a').findOne()
    a.set 'optional', 78
    yield a.save()

  test.serial 'Retrieve a document and it is not validated', (t) ->
    yield (new Test mandatory: 'a').save()
    a = yield Test.where('mandatory').equals('a').findOne()
    a.unset 'mandatory'
    try
      yield a.save()
    catch
      return
    t.fail()

  test.serial 'Save a Model without Schema', (t) ->
    class NoSchema extends Mongorito.Model
    warnCall = no
    console.warn = -> warnCall = yes
    yield (new NoSchema foo: 'bar').save()
    t.fail() if not warnCall

  test.serial 'Save a Model with invalid Schema should throw', (t) ->
    class Invalid extends Mongorito.Model
      Schema: 'invalid'
    try
      yield (new Invalid foo: 'bar').save()
    catch
      return
    t.fail()

  test.serial 'Model with unique attributes should be... unique', (t) ->
    yield (new User name: 'xouabita').save()
    try
      yield (new User name: 'xouabita').save()
    catch
      return
    t.fail()

  test.serial 'Save a model with a valid ID should be OK', (t) ->
    user = new User name: 'xouabita'
    yield user.save()

    post = new Post
      title: 'Hello World'
      content:
        """
        I have been waiting. I've been waiting all day. Waiting for Gus to send
        one of his men to kill me. And it's you. Who do you know, who's okay
        with using children, Jesse? Who do you know... who's allowed children
        to be murdered... hmm? Gus!
        """
      user: (user.get '_id').toString()
    yield post.save()

  test.serial 'It should not work if the ID is invalid', (t) ->
    post = new Post
      title: 'Hello World'
      content: 'Hello Hello Hello'
      user: "sorry"
    try
      yield post.save()
    catch
      return
    t.fail()

  test.serial 'It should not work if the ID is valid but there is no element',
  (t) ->
    user = new Test mandatory: "Coucou"
    yield user.save()

    post = new Post
      title: 'Hello World'
      content: 'YoYoYo'
      user: "#{user.get '_id'}"

    try
      yield post.save()
    catch
      return
    t.fail()

  test.serial 'It should not throw if ID is maybe and there is no ID', (t) ->
    yield (new MaybeID).save()

  test.serial 'It should throw if ID is maybe and the ID is not valid', (t) ->
    user = new Test mandatory: 'coucou'
    yield user.save()
    try
      yield (new MaybeID maybe: "#{user.get '_id'}").save()
    catch
      return
    t.fail()

  test.serial 'It should not throw if ID is maybe and there is a valid ID',
  (t) ->
    user = new User name: 'xouabita'
    yield user.save()
    yield (new MaybeID maybe: "#{user.get '_id'}").save()

  test.serial 'It should work if there is a list of valid ID', (t) ->
    a = new User name: 'xouabita'
    b = new User name: 'yeems'
    yield [a.save(), b.save()]

    yield (new ListID users: ["#{a.get '_id'}", "#{b.get '_id'}"]).save()

  test.serial 'It should fail if there is an invalid ID in the list', (t) ->
    a = new User name: 'xouabita'
    b = new Test mandatory: 'noooooooo'
    yield [a.save(), b.save()]

    try
      yield (new ListID users: ["#{a.get '_id'}", "#{b.get '_id'}"]).save()
    catch
      return
    t.fail()

  test.serial 'It should work with nested list', (t) ->

    a = new User name: 'xouabita'
    b = new Test mandatory: 'nooooo'
    c = new User name: 'jabita'
    yield [a.save(), b.save(), c.save()]
    nl = new NestedList
      comments: [
        content: 'foobarlol'
        likes: [ "#{a.get '_id'}", "#{c.get '_id'}" ]
      ]
    yield nl.save()
    nl.set 'comments.1',
      content: 'mdrbar'
      likes: [ "#{a.get '_id'}", "#{b.get '_id'}" ]
    try
      yield nl.save()
    catch
      return
    t.fail()
