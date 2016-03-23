"use strict";

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

require('colors');

var t = require('tcomb-validation');
var getPathForType = require('./get_path_for_type');
var extractLists = require('./extract_lists');
var co = require('co');

function patch(Model) {
  class Son extends Model {
    constructor() {
      this.haveShema = Boolean(this.Schema);
      if (!this.haveShema) console.warn("[Warning] No Schema!".yellow);
      if (this.haveShema && (!this.Schema.meta || this.Schema.meta.kind !== 'struct')) throw new Error('The Schema need to be of kind struct');
      if (this.haveShema) this.ids = getPathForType(this.Schema, 'ID');

      super.apply(this, arguments);
    }

    configure() {
      super.configure();
      if (!this.Schema) return;
      this.before('save', 'validate');
      this.before('save', 'ensureUnique');
    }

    validateIds() {
      var _this = this;

      return _asyncToGenerator(function* () {
        var ids = extractLists(_this.attributes, _this.ids);

        for (var _ref in ids) {
          var path = _ref.path;
          var type = _ref.type;

          id = _this.get(path);
          if (id && !(yield type.meta.Model.findById("" + id))) throw new Error(`${ path } have not a valid ID`);
        }
      })();
    }

    ensureUnique() {
      var _this2 = this;

      return _asyncToGenerator(function* () {
        var uniques = getPathForType(_this2.Schema, 'unique');
        for (var _ref2 of uniques) {
          var path = _ref2.path;
          var type = _ref2.type;

          yield _this2.constructor.index(path, { unique: true });
        }

        for (var i = 0, len_ = _this2._hooks.before.save.length; i < len_; i++) {
          var hook = _this2._hooks.before.save[i];
          if (hook === _this2.ensureUnique) {
            delete _this2._hooks.before.save[i];
            break;
          }
        }
      })();
    }

    validate() {
      var _this3 = this;

      return _asyncToGenerator(function* () {
        var val = t.validate(_this3.get(), _this3.Schema);
        if (!val.isValid()) throw val.errors;
        return yield _this3.validateIds();
      })();
    }
  }

  return Son;
}

function unique(Type) {
  return t.refinement(Type, () => true, 'unique');
}

var regexID = /^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i;
function ID(Model) {
  let ref = t.refinement(t.String, str => {
    if (regexID.test(str)) return true;else return false;
  }, "ID");
  ref.meta.Model = Model;

  return ref;
}

let Mongorito = require('mongorito');
Mongorito.Model = patch(Mongorito.Model);
Mongorito.patch = patch;
Mongorito.t = require('tcomb');
Mongorito.t.unique = unique;
Mongorito.t.ID = ID;

module.exports = Mongorito;
//# sourceMappingURL=data:application/json;base64,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LEVBQUQsRUFDRixNQUFNLElBQUksTUFBSixDQURSO0FBRUEsZUFBTyxNQUFNLE9BQUssV0FBTCxFQUFOO1dBSlE7S0FBakI7R0EvQ0Y7O0FBdURBLFNBQU8sR0FBUCxDQXhEb0I7Q0FBdEI7O0FBMkRBLFNBQVMsTUFBVCxDQUFnQixJQUFoQixFQUFzQjtBQUNwQixTQUFPLEVBQUUsVUFBRixDQUFhLElBQWIsRUFBbUIsTUFBTSxJQUFOLEVBQVksUUFBL0IsQ0FBUCxDQURvQjtDQUF0Qjs7QUFJQSxJQUFJLFVBQVUsdUNBQVY7QUFDSixTQUFTLEVBQVQsQ0FBWSxLQUFaLEVBQW1CO0FBQ2pCLE1BQUksTUFBTSxFQUFFLFVBQUYsQ0FBYSxFQUFFLE1BQUYsRUFBVSxPQUFTO0FBQ3hDLFFBQUksUUFBUSxJQUFSLENBQWEsR0FBYixDQUFKLEVBQ0UsT0FBTyxJQUFQLENBREYsS0FHRSxPQUFPLEtBQVAsQ0FIRjtHQUQrQixFQUs5QixJQUxPLENBQU4sQ0FEYTtBQU9qQixNQUFJLElBQUosQ0FBUyxLQUFULEdBQWlCLEtBQWpCLENBUGlCOztBQVNqQixTQUFPLEdBQVAsQ0FUaUI7Q0FBbkI7O0FBWUEsSUFBSSxZQUFpQixRQUFRLFdBQVIsQ0FBakI7QUFDSixVQUFVLEtBQVYsR0FBcUIsTUFBTSxVQUFVLEtBQVYsQ0FBM0I7QUFDQSxVQUFVLEtBQVYsR0FBcUIsS0FBckI7QUFDQSxVQUFVLENBQVYsR0FBcUIsUUFBUSxPQUFSLENBQXJCO0FBQ0EsVUFBVSxDQUFWLENBQVksTUFBWixHQUFxQixNQUFyQjtBQUNBLFVBQVUsQ0FBVixDQUFZLEVBQVosR0FBcUIsRUFBckI7O0FBRUEsT0FBTyxPQUFQLEdBQWlCLFNBQWpCIiwiZmlsZSI6ImluZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2Ugc3RyaWN0XCJcbnJlcXVpcmUoJ2NvbG9ycycpXG5cbnZhciB0ICAgICAgICAgICAgICA9IHJlcXVpcmUoJ3Rjb21iLXZhbGlkYXRpb24nKVxudmFyIGdldFBhdGhGb3JUeXBlID0gcmVxdWlyZSgnLi9nZXRfcGF0aF9mb3JfdHlwZScpXG52YXIgZXh0cmFjdExpc3RzICAgPSByZXF1aXJlKCcuL2V4dHJhY3RfbGlzdHMnKVxudmFyIGNvICAgICAgICAgICAgID0gcmVxdWlyZSgnY28nKVxuXG5mdW5jdGlvbiBwYXRjaChNb2RlbCkge1xuICBjbGFzcyBTb24gZXh0ZW5kcyBNb2RlbCB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICB0aGlzLmhhdmVTaGVtYSA9IEJvb2xlYW4odGhpcy5TY2hlbWEpXG4gICAgICBpZiAoIXRoaXMuaGF2ZVNoZW1hKVxuICAgICAgICBjb25zb2xlLndhcm4oXCJbV2FybmluZ10gTm8gU2NoZW1hIVwiLnllbGxvdylcbiAgICAgIGlmICh0aGlzLmhhdmVTaGVtYSAmJlxuICAgICAgICAgICAgICAgKCF0aGlzLlNjaGVtYS5tZXRhIHx8IHRoaXMuU2NoZW1hLm1ldGEua2luZCAhPT0gJ3N0cnVjdCcpKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1RoZSBTY2hlbWEgbmVlZCB0byBiZSBvZiBraW5kIHN0cnVjdCcpXG4gICAgICBpZiAodGhpcy5oYXZlU2hlbWEpXG4gICAgICAgIHRoaXMuaWRzID0gZ2V0UGF0aEZvclR5cGUodGhpcy5TY2hlbWEsICdJRCcpXG5cbiAgICAgIHN1cGVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cylcbiAgICB9XG5cbiAgICBjb25maWd1cmUoKSB7XG4gICAgICBzdXBlci5jb25maWd1cmUoKVxuICAgICAgaWYgKCF0aGlzLlNjaGVtYSlcbiAgICAgICAgcmV0dXJuXG4gICAgICB0aGlzLmJlZm9yZSgnc2F2ZScsICd2YWxpZGF0ZScpXG4gICAgICB0aGlzLmJlZm9yZSgnc2F2ZScsICdlbnN1cmVVbmlxdWUnKVxuICAgIH1cblxuICAgIGFzeW5jIHZhbGlkYXRlSWRzKCkge1xuICAgICAgdmFyIGlkcyA9IGV4dHJhY3RMaXN0cyh0aGlzLmF0dHJpYnV0ZXMsIHRoaXMuaWRzKVxuXG4gICAgICBmb3IgKHZhciB7cGF0aCwgdHlwZX0gaW4gaWRzKSB7XG4gICAgICAgIGlkID0gdGhpcy5nZXQocGF0aClcbiAgICAgICAgaWYgKGlkICYmICEoYXdhaXQgdHlwZS5tZXRhLk1vZGVsLmZpbmRCeUlkKFwiXCIgKyBpZCkpKVxuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgJHtwYXRofSBoYXZlIG5vdCBhIHZhbGlkIElEYClcbiAgICAgIH1cbiAgICB9XG5cbiAgICBhc3luYyBlbnN1cmVVbmlxdWUoKSB7XG4gICAgICB2YXIgdW5pcXVlcyA9IGdldFBhdGhGb3JUeXBlKHRoaXMuU2NoZW1hLCAndW5pcXVlJylcbiAgICAgIGZvciAodmFyIHtwYXRoLCB0eXBlfSBvZiB1bmlxdWVzKSB7XG4gICAgICAgIGF3YWl0IHRoaXMuY29uc3RydWN0b3IuaW5kZXgocGF0aCwge3VuaXF1ZTogdHJ1ZX0pXG4gICAgICB9XG5cbiAgICAgIGZvciAodmFyIGkgPSAwLCBsZW5fID0gdGhpcy5faG9va3MuYmVmb3JlLnNhdmUubGVuZ3RoOyBpIDwgbGVuXzsgaSsrKSB7XG4gICAgICAgIHZhciBob29rID0gdGhpcy5faG9va3MuYmVmb3JlLnNhdmVbaV1cbiAgICAgICAgaWYgKGhvb2sgPT09IHRoaXMuZW5zdXJlVW5pcXVlKSB7XG4gICAgICAgICAgZGVsZXRlIHRoaXMuX2hvb2tzLmJlZm9yZS5zYXZlW2ldXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGFzeW5jIHZhbGlkYXRlKCkge1xuICAgICAgdmFyIHZhbCA9IHQudmFsaWRhdGUodGhpcy5nZXQoKSwgdGhpcy5TY2hlbWEpXG4gICAgICBpZiAoIXZhbC5pc1ZhbGlkKCkpXG4gICAgICAgIHRocm93IHZhbC5lcnJvcnNcbiAgICAgIHJldHVybiBhd2FpdCB0aGlzLnZhbGlkYXRlSWRzKClcbiAgICB9XG4gIH1cblxuICByZXR1cm4gU29uXG59XG5cbmZ1bmN0aW9uIHVuaXF1ZShUeXBlKSB7XG4gIHJldHVybiB0LnJlZmluZW1lbnQoVHlwZSwgKCkgPT4gdHJ1ZSwgJ3VuaXF1ZScpXG59XG5cbnZhciByZWdleElEID0gL14oPz1bYS1mXFxkXXsyNH0kKShcXGQrW2EtZl18W2EtZl0rXFxkKS9pXG5mdW5jdGlvbiBJRChNb2RlbCkge1xuICBsZXQgcmVmID0gdC5yZWZpbmVtZW50KHQuU3RyaW5nLCAoc3RyKSA9PiB7XG4gICAgaWYgKHJlZ2V4SUQudGVzdChzdHIpKVxuICAgICAgcmV0dXJuIHRydWVcbiAgICBlbHNlXG4gICAgICByZXR1cm4gZmFsc2VcbiAgfSwgXCJJRFwiKVxuICByZWYubWV0YS5Nb2RlbCA9IE1vZGVsXG5cbiAgcmV0dXJuIHJlZlxufVxuXG5sZXQgTW9uZ29yaXRvICAgICAgPSByZXF1aXJlKCdtb25nb3JpdG8nKVxuTW9uZ29yaXRvLk1vZGVsICAgID0gcGF0Y2goTW9uZ29yaXRvLk1vZGVsKVxuTW9uZ29yaXRvLnBhdGNoICAgID0gcGF0Y2hcbk1vbmdvcml0by50ICAgICAgICA9IHJlcXVpcmUoJ3Rjb21iJylcbk1vbmdvcml0by50LnVuaXF1ZSA9IHVuaXF1ZVxuTW9uZ29yaXRvLnQuSUQgICAgID0gSURcblxubW9kdWxlLmV4cG9ydHMgPSBNb25nb3JpdG9cbiJdfQ==