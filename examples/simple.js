import Mongorito, {t, Model} from '../lib'

class Person extends Model {
  get Schema() {
    return t.struct({
      name: t.String,
      surname: t.maybe(t.String),
      age: t.Number
    })
  }
}

(async () => {
  try {
    await Mongorito.connect('localhost/mongorito-tcomb')
    await Person.index('name', {unique: true})
    var paul = new Person({name: 'paul', age: 42})
    await paul.save()
    await paul.remove()
    await Mongorito.disconnect()
  } catch (e) {
    console.log(e.stack)
  }
})()
