var get = require('get-value')

function extractLists(attrs, paths) {
  var noLists = []
  var lists   = []

  for (var {path, type} of paths) {
    var [test] = path.split('.0')
    if (test !== path)
      lists.push({path, type})
    else
      noLists.push({path, type})
  }

  for (var {path, type} of lists) {
    var [before, after] = path.split('.0', 2)
    var arr = get(attrs, before)

    var newPaths = []
    var newAttrs = []

    for (var i = 0, len_ = arr.length; i < len_; ++i) {
      var elt = arr[i]
      newPaths.push({path: `${before}.${i}`, type })
      newAttrs.push(elt)
    }

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
