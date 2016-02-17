Mongorito = {t} = require './src/index.coffee'
co        = require 'co'

class User extends Mongorito.Model

  Schema: t.struct
    name: t.unique t.String

class Post extends Mongorito.Model

  Schema: t.struct
    title: t.String
    content: t.String
    user: t.ID User

co ->
  yield Mongorito.connect 'localhost/mongorito-tcomb'
  yield User.remove()

  jean = new User name: 'jean'
  yield jean.save()

  try
    err = new User name: 'jean'
    yield err.save()
  catch e
    console.log (if e.stack then e.stack else e)
  finally
    yield Mongorito.disconnect()
