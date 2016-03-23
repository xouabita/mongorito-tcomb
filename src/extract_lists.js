var get = require('get-value')

function extractLists(attrs, paths) {
  var noLists = []
  var lists   = []

  for (var {path, type} of paths) {
    var [test] = path.split('.0')
    if (test !== path)
      list.push({path, type})
    else
      noLists.push({path, type})
  }

  for (var {path, type} of paths) {
    var [before, after] = path.split('.0', 2)
    var arr = get(attrs, before)

    var newPaths = []
    var newAttrs = []

    arr.forEach((elt, i) => {
      newPaths.push({path: `${before}.${i}`, type })
      newAttrs.push(elt)
    })

    if (!after)
      for (var path of newPaths)
        noLists.push(path)
    else
      for (var elt of newAttrs)
        noLists = noLists.concat(extractLists(elt, {path: after, type}))
  }

  return noLists
}

module.exports = extractLists
