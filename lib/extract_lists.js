'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var get = require('get-value');

function extractLists(attrs, paths) {
  var noLists = [];
  var lists = [];

  for (var _ref of paths) {
    var path = _ref.path;
    var type = _ref.type;

    var _path$split = path.split('.0');

    var _path$split2 = _slicedToArray(_path$split, 1);

    var test = _path$split2[0];

    if (test !== path) list.push({ path: path, type: type });else noLists.push({ path: path, type: type });
  }

  for (var _ref2 of paths) {
    var path = _ref2.path;
    var type = _ref2.type;

    var _path$split3 = path.split('.0', 2);

    var _path$split4 = _slicedToArray(_path$split3, 2);

    var before = _path$split4[0];
    var after = _path$split4[1];

    var arr = get(attrs, before);

    var newPaths = [];
    var newAttrs = [];

    arr.forEach((elt, i) => {
      newPaths.push({ path: `${ before }.${ i }`, type: type });
      newAttrs.push(elt);
    });

    if (!after) for (var path of newPaths) noLists.push(path);else for (var elt of newAttrs) noLists = noLists.concat(extractLists(elt, { path: after, type: type }));
  }

  return noLists;
}

module.exports = extractLists;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9leHRyYWN0X2xpc3RzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7QUFBQSxJQUFJLE1BQU0sUUFBUSxXQUFSLENBQU47O0FBRUosU0FBUyxZQUFULENBQXNCLEtBQXRCLEVBQTZCLEtBQTdCLEVBQW9DO0FBQ2xDLE1BQUksVUFBVSxFQUFWLENBRDhCO0FBRWxDLE1BQUksUUFBVSxFQUFWLENBRjhCOztBQUlsQyxtQkFBeUIsS0FBekIsRUFBZ0M7UUFBdEIsaUJBQXNCO1FBQWhCLGlCQUFnQjs7c0JBQ2pCLEtBQUssS0FBTCxDQUFXLElBQVgsRUFEaUI7Ozs7UUFDekIsdUJBRHlCOztBQUU5QixRQUFJLFNBQVMsSUFBVCxFQUNGLEtBQUssSUFBTCxDQUFVLEVBQUMsVUFBRCxFQUFPLFVBQVAsRUFBVixFQURGLEtBR0UsUUFBUSxJQUFSLENBQWEsRUFBQyxVQUFELEVBQU8sVUFBUCxFQUFiLEVBSEY7R0FGRjs7QUFRQSxvQkFBeUIsS0FBekIsRUFBZ0M7UUFBdEIsa0JBQXNCO1FBQWhCLGtCQUFnQjs7dUJBQ1IsS0FBSyxLQUFMLENBQVcsSUFBWCxFQUFpQixDQUFqQixFQURROzs7O1FBQ3pCLHlCQUR5QjtRQUNqQix3QkFEaUI7O0FBRTlCLFFBQUksTUFBTSxJQUFJLEtBQUosRUFBVyxNQUFYLENBQU4sQ0FGMEI7O0FBSTlCLFFBQUksV0FBVyxFQUFYLENBSjBCO0FBSzlCLFFBQUksV0FBVyxFQUFYLENBTDBCOztBQU85QixRQUFJLE9BQUosQ0FBWSxDQUFDLEdBQUQsRUFBTSxDQUFOLEtBQVk7QUFDdEIsZUFBUyxJQUFULENBQWMsRUFBQyxNQUFNLENBQUMsR0FBRSxNQUFILEVBQVUsQ0FBVixHQUFhLENBQWIsRUFBZSxDQUFyQixFQUF3QixVQUF6QixFQUFkLEVBRHNCO0FBRXRCLGVBQVMsSUFBVCxDQUFjLEdBQWQsRUFGc0I7S0FBWixDQUFaLENBUDhCOztBQVk5QixRQUFJLENBQUMsS0FBRCxFQUNGLEtBQUssSUFBSSxJQUFKLElBQVksUUFBakIsRUFDRSxRQUFRLElBQVIsQ0FBYSxJQUFiLEVBREYsS0FHQSxLQUFLLElBQUksR0FBSixJQUFXLFFBQWhCLEVBQ0UsVUFBVSxRQUFRLE1BQVIsQ0FBZSxhQUFhLEdBQWIsRUFBa0IsRUFBQyxNQUFNLEtBQU4sRUFBYSxVQUFkLEVBQWxCLENBQWYsQ0FBVixDQURGO0dBaEJKOztBQW9CQSxTQUFPLE9BQVAsQ0FoQ2tDO0NBQXBDOztBQW1DQSxPQUFPLE9BQVAsR0FBaUIsWUFBakIiLCJmaWxlIjoiZXh0cmFjdF9saXN0cy5qcyIsInNvdXJjZXNDb250ZW50IjpbInZhciBnZXQgPSByZXF1aXJlKCdnZXQtdmFsdWUnKVxuXG5mdW5jdGlvbiBleHRyYWN0TGlzdHMoYXR0cnMsIHBhdGhzKSB7XG4gIHZhciBub0xpc3RzID0gW11cbiAgdmFyIGxpc3RzICAgPSBbXVxuXG4gIGZvciAodmFyIHtwYXRoLCB0eXBlfSBvZiBwYXRocykge1xuICAgIHZhciBbdGVzdF0gPSBwYXRoLnNwbGl0KCcuMCcpXG4gICAgaWYgKHRlc3QgIT09IHBhdGgpXG4gICAgICBsaXN0LnB1c2goe3BhdGgsIHR5cGV9KVxuICAgIGVsc2VcbiAgICAgIG5vTGlzdHMucHVzaCh7cGF0aCwgdHlwZX0pXG4gIH1cblxuICBmb3IgKHZhciB7cGF0aCwgdHlwZX0gb2YgcGF0aHMpIHtcbiAgICB2YXIgW2JlZm9yZSwgYWZ0ZXJdID0gcGF0aC5zcGxpdCgnLjAnLCAyKVxuICAgIHZhciBhcnIgPSBnZXQoYXR0cnMsIGJlZm9yZSlcblxuICAgIHZhciBuZXdQYXRocyA9IFtdXG4gICAgdmFyIG5ld0F0dHJzID0gW11cblxuICAgIGFyci5mb3JFYWNoKChlbHQsIGkpID0+IHtcbiAgICAgIG5ld1BhdGhzLnB1c2goe3BhdGg6IGAke2JlZm9yZX0uJHtpfWAsIHR5cGUgfSlcbiAgICAgIG5ld0F0dHJzLnB1c2goZWx0KVxuICAgIH0pXG5cbiAgICBpZiAoIWFmdGVyKVxuICAgICAgZm9yICh2YXIgcGF0aCBvZiBuZXdQYXRocylcbiAgICAgICAgbm9MaXN0cy5wdXNoKHBhdGgpXG4gICAgZWxzZVxuICAgICAgZm9yICh2YXIgZWx0IG9mIG5ld0F0dHJzKVxuICAgICAgICBub0xpc3RzID0gbm9MaXN0cy5jb25jYXQoZXh0cmFjdExpc3RzKGVsdCwge3BhdGg6IGFmdGVyLCB0eXBlfSkpXG4gIH1cblxuICByZXR1cm4gbm9MaXN0c1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGV4dHJhY3RMaXN0c1xuIl19