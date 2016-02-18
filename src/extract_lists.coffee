get = require 'get-value'

module.exports = extractLists = (attrs, paths) ->

  # Separate the paths in two parts: the one which have list and the one which
  # does not
  noLists = []
  lists   = []

  for {path, type} in paths
    if path.indexOf '.0' isnt -1
      lists.push {path, type}
    else
      noLists.push {path, type}

  for {path, type} in lists

    [before, after] = path.split '.0', 2
    arr = get attrs, before

    newPaths = []
    newAttrs = []
    for elt, i in arr
      newPaths.push { path: "#{before}.#{i}", type }
      newAttrs.push elt

    unless after
      noLists.push path for path in newPaths
    else
      for attr in newAttrs
        noLists = noLists.concat (extractList attr, {path: after, type})

  return noLists
