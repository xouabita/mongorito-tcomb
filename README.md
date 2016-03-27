<h1 align="center">Mongorito Tcomb</h1>
<p align="center">
  <a href="https://travis-ci.org/xouabita/mongorito-tcomb">
    <img src="https://travis-ci.org/xouabita/mongorito-tcomb.svg?branch=master" />
  </a>
  <a href="https://david-dm.org/xouabita/mongorito-tcomb">
    <img src="https://david-dm.org/xouabita/mongorito-tcomb.svg" />
  </a>
  <a href="https://david-dm.org/xouabita/mongorito-tcomb/">
    <img src="https://david-dm.org/xouabita/mongorito-tcomb/dev-status.svg"
  </a>
  <a href="https://coveralls.io/github/xouabita/mongorito-tcomb?branch=master">
    <img src="https://coveralls.io/repos/github/xouabita/mongorito-tcomb/badge.svg?branch=master" />
  </a>
  <a href="https://codeclimate.com/github/xouabita/mongorito-tcomb">
    <img src="https://codeclimate.com/github/xouabita/mongorito-tcomb/badges/gpa.svg" />
  </a>
</p>

<h4 align="center"><i>Bring schema validation to Mongorito thanks to tcomb</i></h4>

---

Install
-------

`npm i -S mongorito-tcomb`

Usage (ES6)
-----------

~~~js
import Mongorito, {t, Model} from '../lib'

class Person extends Model {
  get Schema() {
    return t.struct({ // return a tcomb struct
      name: t.String,
      surname: t.maybe(t.String),
      age: t.Number
    })
  }
}

(async () => {
  try {
    await Mongorito.connect('localhost/mongorito-tcomb') // Connect like with Mongorito
    await Person.index('name', {unique: true}) // Ensure name is unique
    var paul = new Person({name: 'paul', age: 42})
    await paul.save()
    await paul.remove()
    await Mongorito.disconnect()
  } catch (e) {
    console.log(e.stack)
  }
})()
~~~

API
---

### Mixins

#### `patch: (Model) -> PatchedModel`

The patch function can be useful to combine different Mongorito plugins. It take a class,
extend it then return the extended class.

### Customs tcomb types

#### `t.ID`

It represent the ID of an element in the database.  
**Usage:** `t.ID(ctx, M)` where M is a Mongorito model and ctx the instance
of the model  
It ensure that ID is valid and exist in the database
