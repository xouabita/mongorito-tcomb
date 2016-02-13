Mongorito = require './src/index.coffee'
t         = require 'tcomb-validation'
co        = require 'co'

personSchema = t.struct
  name: t.unique t.String
  surname: t.maybe t.String
  age: t.Number

class Person extends Mongorito.Model

  Schema: personSchema

co ->
  yield Mongorito.connect 'localhost/mongorito-tcomb'

  paul = new Person name: 'paul', age: 42
  yield paul.save()
  paul.set 'age', 43
  yield paul.save()
  yield paul.remove()
.then -> co ->
  jacques = new Person name: 'jacques'
  yield jacques.save()
.catch (e) ->
  console.log e
  Mongorito.disconnect()
