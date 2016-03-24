import test from 'ava'
import Mongorito, {t, Model} from '../lib'

class Test extends Model {
  get Schema() {
    return t.struct({
      mandatory: t.String,
      optional: t.maybe(t.Number)
    })
  }
}

class NoSchema extends Model {}

class Invalid extends Model {
  get Schema() {
    return 'invalid'
  }
}

class User extends Model {
  get Schema() {
    return t.struct({
      name: t.unique(t.String),
      age: t.maybe(t.Number)
    })
  }
}

class TestUnique extends Model {
  get Schema() {
    return t.struct({
      name: t.unique(t.String)
    })
  }
}

class MaybeID extends Model {
  get Schema() {
    return t.struct({
      maybe: t.maybe(t.ID(User))
    })
  }
}

class Post extends Model {
  get Schema() {
    return t.struct({
      title: t.String,
      content: t.String,
      user: t.ID(User)
    })
  }
}

async function removeAll() {
  await Promise.all([
    Test.remove(),
    TestUnique.remove(),
    NoSchema.remove(),
    Invalid.remove(),
    User.remove(),
    MaybeID.remove()
  ])

  try {
    await Promise.all([
      Test._collection().dropIndexes(),
      TestUnique._collection().dropIndexes(),
      NoSchema._collection().dropIndexes(),
      Invalid._collection().dropIndexes(),
      User._collection().dropIndexes(),
      MaybeID._collection().dropIndexes()
    ])
  } catch (e) {}
}

test.before(async () => {
  await Mongorito.connect('localhost/mongorito-tcomb-tests')
  await removeAll()
})

test.after(async () => {
  await removeAll()
  await Mongorito.disconnect()
})

test('Test valid data', async t => {
  var a = new Test({mandatory: 'a'})
  await a.save()
})

test('Throw on error', async t => {
  var a = new Test({optional: 56})
  try {
    await a.save()
  } catch (e) {
    return
  }
  t.fail()
})

test('Retrieve a document and it is not validated', async t => {
  var tst = new Test({mandatory: 'b'})
  await tst.save()
  var a = await Test.where('mandatory', 'b').findOne()
  a.set('optional', 78)
  await a.save()
})

test('Retrieve a document and it is not validated', async t => {
  await (new Test({mandatory: 'c'})).save()
  var a = await Test.where('mandatory').equals('c').findOne()
  a.unset('mandatory')
  try {
    await a.save()
  } catch (e) {
    return
  }
  t.fail()
})

test('save a Model without Schema', async t => {
  var warnCall = false
  console.warn = () => warnCall = true
  await (new NoSchema({foo: 'bar'})).save()
  if (!warnCall)
    t.fail()
})

test('Save a Model with invalid Schema should throw', async t => {
  try {
    await (new Invalid({foo: 'bar'})).save()
  } catch (e) {
    return
  }
  t.fail()
})

test('Model with unique attributes should be... unique', async t => {
  await (new TestUnique({name: 'xouabita'})).save()
  try {
    await (new TestUnique({name: 'xouabita'})).save()
  } catch (e) {
    return
  }
  t.fail()
})

test('Save a model with a valid ID should be OK', async t => {
  var user = new User({name: 'xouabita'})
  await user.save()

  var post = new Post({
    title: 'Hello World',
    content:
      `
      I have been waiting. I've been waiting all day. Waiting for Gus to send
      one of his men to kill me. And it's you. Who do you know, who's okay
      with using children, Jesse? Who do you know... who's allowed children
      to be murdered... hmm? Gus!
      `,
      user: "" + user.get('_id')
  })
  await post.save()
})

test('It should not work if the ID is invalid', async t => {
  var post = new Post({
    title: 'Hello World',
    content: 'Hello Hello Hello',
    user: "sorry"
  })
  try {
    await post.save()
  } catch (e) {
    return
  }
  t.fail()
})

test('It should not work if the ID is valid but there is no element', async t => {
  var user = new Test({mandatory: "Coucou"})
  await user.save()

  var post = new Post({
    title: 'Hello World',
    content: 'YoYoYo',
    user: "" + user.get('_id')
  })

  try {
    await post.save()
  } catch (e) {
    return
  }
  t.fail()
})

test('It should not throw if ID is maybe and there is no ID', async t => {
  await (new MaybeID).save()
})

test('It should throw if ID is maybe and the ID is not valid', async t => {
  var user = new Test({mandatory: 'coucou'})
  await user.save()
  try {
    await (new MaybeID({maybe: `${user.get('_id')}`})).save()
  } catch (e) {
    return
  }
  t.fail()
})
