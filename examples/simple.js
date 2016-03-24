import Mongorito from '../lib'
import t from 'tcomb-validation'

let personSchema = t.struct({
  name: t.unique(t.String),
  surname: t.maybe(t.String),
  age: t.Number
})

class Person extends Mongorito.Model {
  get Schema() {
    return personSchema
  }
}

(async () => {
  try {
    await Mongorito.connect('localhost/mongorito-tcomb')
    var paul = new Person({name: 'paul', age: 42})
    await paul.save()
    await paul.remove()
    await Mongorito.disconnect()
  } catch (e) {
    console.log(e.stack)
  }
})()
