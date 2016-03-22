function getPathForType (type, name, currentPath = '') {

  var currentKind = type.meta.kind
  var dot = ''
  if (currentPath)
    dot = '.'

  switch (currentKind) {
    case 'struct':
      var paths = []

      for (var key in type.meta.props) {
        var value = type.meta.props[key]
        paths = paths.concat(getPathForType(value, name, dot.concat(key)))
      }

      return paths

    case 'maybe':
      return getPathForType(type.mea.type, name, "".concat(currentPath))

    case 'list'
      return getPathForType(type.meta.type, name, (dot.concat('0')))

    case 'irreductible':
    case 'subtype':
      if (type.meta.name === name)
        return [{path: "" + currentPath, type}]
      else
        return []

    default:
      throw new Error(`Type unsupported ${currentKind}`)
  }
}
