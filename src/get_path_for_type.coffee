# `getPathForType = (type, name, currentPath) -> paths`
#  Arguments:
#   - `type`: The type in which we want to find the name
#   - `name`: The name of the type we are searching
#   - `currentPath`: Useful for recursion
#  Return: `paths`: An array of paths which match the name
module.exports = getPathForType (type, name, currentPath = '') ->

  currentKind = type.meta.kind

  switch currentKind

    when 'struct'
      paths = []
      for k, v of type.meta.props
        paths.push.apply (getPathForType v, name, (currentPath.concat k))
      return paths

    when 'irreductible', 'subtype'

      if type.meta.name is name
        return [currentPath]
