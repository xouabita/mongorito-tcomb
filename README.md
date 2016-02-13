# mongorito-tcomb [![Build Status](https://travis-ci.org/xouabita/mongorito-tcomb.svg?branch=master)](https://travis-ci.org/xouabita/mongorito-tcomb) [![Dependency Status](https://david-dm.org/xouabita/mongorito-tcomb.svg)](https://david-dm.org/xouabita/mongorito-tcomb) [![devDependency Status](https://david-dm.org/alanshaw/david/dev-status.svg)](https://david-dm.org/alanshaw/david#info=devDependencies) [![Coverage Status](https://coveralls.io/repos/github/xouabita/mongorito-tcomb/badge.svg?branch=master)](https://coveralls.io/github/xouabita/mongorito-tcomb?branch=master)
Bring schema validation to Mongorito thanks to tcomb

Install
-------

`npm i -S mongorito-tcomb`

Usage (ES6)
-----------

~~~js
// 1. Import the dependencies
import co from 'co'
import t from 'tcomb'
import Mongorito, {Model} from 'mongorito-tcomb'

// 2. We define the model user
class User extends Model {

  // We add the optional Schema
  get Schema() {
    return t.struct({
      name: t.String,            // name is a required String
      surname: t.maybe(t.String) // surname is an optional String
    });
  }
}

co(function *(val) {

  // 3. Connect the database
  yield Mongorito.connect('localhost/mongo-tcomb-playground');

  // 4. Save a valid Model
  var valid = new User({name: "Valid"});
  yield valid.save();

  // 5. Try to save an invalid Model
  var invalid = new User({name: 'Invalid', surname: 88});
  try {
    yield invalid.save();
  } catch (e) {
    console.log(e); // An exception is throw here
  }

  // 6. Don't forget to disconnect Mongorito
  yield Mongorito.disconnect();
});
~~~

For **coffeescript**, you can see [`example.coffee`](https://github.com/xouabita/mongorito-tcomb/blob/master/example.coffee)

API
---

### `patch: (Model) -> PatchedModel`

The patch function can be useful to combine different Mongorito plugins. It take a class,
extend it then return the extended class.

TODOS
-----

- [ ] Add t.ID for validating ID
