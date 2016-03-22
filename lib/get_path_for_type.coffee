# `getPathForType = (type, name, currentPath) -> paths`
#  Arguments:
#   - `type`: The type in which we want to find the name
#   - `name`: The name of the type we are searching
#   - `currentPath`: Useful for recursion
#  Return: `paths`: An array of paths which match the name
module.exports = getPathForType = (type, name, currentPath = '') ->

  currentKind = type.meta.kind

  switch currentKind

    when 'struct'
      paths = []
      for k, v of type.meta.props
        dot   = currentPath.concat (if currentPath then '.' else '')
        paths = paths.concat (getPathForType v, name, (dot.concat k))
      return paths

    when 'maybe'
      return getPathForType type.meta.type, name, ("".concat currentPath)

    when 'list'
      dot = currentPath.concat (if currentPath then '.' else '')
      return getPathForType type.meta.type, name, (dot.concat '0')

    when 'irreducible', 'subtype'

      if type.meta.name is name
        return [{path: "#{currentPath}", type}]
      return []

    else return []
