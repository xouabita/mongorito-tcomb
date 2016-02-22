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
// 1. Import the dependencies
import co from 'co'
import Mongorito, {Model, t} from 'mongorito-tcomb'

// 2. Let's define some Model

class User extends Model {

  // We add the optional Schema
  get Schema() {
    return t.struct({
      name: t.unique(t.String),  // name is a required String and is unique
      surname: t.maybe(t.String) // surname is an optional String
    });
  }
}

class Post extends Model {

  get Schema() {
    return t.struct({
      title: t.String,
      content: t.String,
      author: t.ID(User) // Here we set the id of the author
    });
  }

}

co(function *(val) {

  // 3. Connect the database
  yield Mongorito.connect('localhost/mongo-tcomb-playground');


  // 4. Remove all users (for examples purpose)
  yield User.remove()

  // 5. Save a valid Model
  var valid = new User({name: 'Valid'});
  yield valid.save();

  // 6. Try to save an invalid Model
  var invalid = new User({name: 'Invalid', surname: 88});
  try {
    yield invalid.save();
  } catch (e) {
    console.log(e); // An exception is throw here
  }

  // 7. You can't create a new user with the same name
  var sameName = new User({name: 'Valid', surname: 'But not unique' });
  try {
    yield sameName.save();
  } catch (e) {
    console.log(e); // An exception is throw here
  }

  // 8. Let's now create a Post
  var post = new Post({
    title: 'Hello',
    content: 'Lorem Ipsum...',
    author: "" + valid.get('_id')
  });

  yield post.save();

  // 9. You can't save post with invalid IDs
  post.set('author', 'I want to be an ID...');

  try {
    yield post.save();
  } catch (e) {
    console.log(e); // An exception is throw here
  }


  // 10. And you can't save post with an ID which is not an User
  post.set('author', '' + post.get('_id'));

  try {
    yield post.save();
  } catch (e) {
    console.log(e); // An exception is throw here
  }

  // 11. Don't forget to disconnect Mongorito
  yield Mongorito.disconnect();
});

~~~

For **coffeescript**, you can see [`examples`](https://github.com/xouabita/mongorito-tcomb/blob/master/examples/)

API
---

### Mixins

#### `patch: (Model) -> PatchedModel`

The patch function can be useful to combine different Mongorito plugins. It take a class,
extend it then return the extended class.

### Customs tcomb types

#### `t.unique`

It ensure that the type is unique in the database.  
**Usage:** `t.unique(T)` where T is any tcomb type

#### `t.ID`

It represent the ID of an element in the database.  
**Usage:** `t.ID(M)` where M is a Mongorito model  
It ensure that ID is valid and exist in the database

TODOS
-----

- [ ] More human exceptions
