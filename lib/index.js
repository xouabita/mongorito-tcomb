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

      super(...arguments);
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
//# sourceMappingURL=data:application/json;base64,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SUFBSSxNQUFKLENBRFI7QUFFQSxlQUFPLE1BQU0sT0FBSyxXQUFMLEVBQU47V0FKUTtLQUFqQjtHQS9DRjs7QUF1REEsU0FBTyxHQUFQLENBeERvQjtDQUF0Qjs7QUEyREEsU0FBUyxNQUFULENBQWdCLElBQWhCLEVBQXNCO0FBQ3BCLFNBQU8sRUFBRSxVQUFGLENBQWEsSUFBYixFQUFtQixNQUFNLElBQU4sRUFBWSxRQUEvQixDQUFQLENBRG9CO0NBQXRCOztBQUlBLElBQUksVUFBVSx1Q0FBVjtBQUNKLFNBQVMsRUFBVCxDQUFZLEtBQVosRUFBbUI7QUFDakIsTUFBSSxNQUFNLEVBQUUsVUFBRixDQUFhLEVBQUUsTUFBRixFQUFVLE9BQVM7QUFDeEMsUUFBSSxRQUFRLElBQVIsQ0FBYSxHQUFiLENBQUosRUFDRSxPQUFPLElBQVAsQ0FERixLQUdFLE9BQU8sS0FBUCxDQUhGO0dBRCtCLEVBSzlCLElBTE8sQ0FBTixDQURhO0FBT2pCLE1BQUksSUFBSixDQUFTLEtBQVQsR0FBaUIsS0FBakIsQ0FQaUI7O0FBU2pCLFNBQU8sR0FBUCxDQVRpQjtDQUFuQjs7QUFZQSxJQUFJLFlBQWlCLFFBQVEsV0FBUixDQUFqQjtBQUNKLFVBQVUsS0FBVixHQUFxQixNQUFNLFVBQVUsS0FBVixDQUEzQjtBQUNBLFVBQVUsS0FBVixHQUFxQixLQUFyQjtBQUNBLFVBQVUsQ0FBVixHQUFxQixRQUFRLE9BQVIsQ0FBckI7QUFDQSxVQUFVLENBQVYsQ0FBWSxNQUFaLEdBQXFCLE1BQXJCO0FBQ0EsVUFBVSxDQUFWLENBQVksRUFBWixHQUFxQixFQUFyQjs7QUFFQSxPQUFPLE9BQVAsR0FBaUIsU0FBakIiLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzdHJpY3RcIlxucmVxdWlyZSgnY29sb3JzJylcblxudmFyIHQgICAgICAgICAgICAgID0gcmVxdWlyZSgndGNvbWItdmFsaWRhdGlvbicpXG52YXIgZ2V0UGF0aEZvclR5cGUgPSByZXF1aXJlKCcuL2dldF9wYXRoX2Zvcl90eXBlJylcbnZhciBleHRyYWN0TGlzdHMgICA9IHJlcXVpcmUoJy4vZXh0cmFjdF9saXN0cycpXG52YXIgY28gICAgICAgICAgICAgPSByZXF1aXJlKCdjbycpXG5cbmZ1bmN0aW9uIHBhdGNoKE1vZGVsKSB7XG4gIGNsYXNzIFNvbiBleHRlbmRzIE1vZGVsIHtcbiAgICBjb25zdHJ1Y3RvciguLi5hcmdzKSB7XG4gICAgICB0aGlzLmhhdmVTaGVtYSA9IEJvb2xlYW4odGhpcy5TY2hlbWEpXG4gICAgICBpZiAoIXRoaXMuaGF2ZVNoZW1hKVxuICAgICAgICBjb25zb2xlLndhcm4oXCJbV2FybmluZ10gTm8gU2NoZW1hIVwiLnllbGxvdylcbiAgICAgIGlmICh0aGlzLmhhdmVTaGVtYSAmJlxuICAgICAgICAgICAgICAgKCF0aGlzLlNjaGVtYS5tZXRhIHx8IHRoaXMuU2NoZW1hLm1ldGEua2luZCAhPT0gJ3N0cnVjdCcpKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1RoZSBTY2hlbWEgbmVlZCB0byBiZSBvZiBraW5kIHN0cnVjdCcpXG4gICAgICBpZiAodGhpcy5oYXZlU2hlbWEpXG4gICAgICAgIHRoaXMuaWRzID0gZ2V0UGF0aEZvclR5cGUodGhpcy5TY2hlbWEsICdJRCcpXG5cbiAgICAgIHN1cGVyKC4uLmFyZ3MpXG4gICAgfVxuXG4gICAgY29uZmlndXJlKCkge1xuICAgICAgc3VwZXIuY29uZmlndXJlKClcbiAgICAgIGlmICghdGhpcy5TY2hlbWEpXG4gICAgICAgIHJldHVyblxuICAgICAgdGhpcy5iZWZvcmUoJ3NhdmUnLCAndmFsaWRhdGUnKVxuICAgICAgdGhpcy5iZWZvcmUoJ3NhdmUnLCAnZW5zdXJlVW5pcXVlJylcbiAgICB9XG5cbiAgICBhc3luYyB2YWxpZGF0ZUlkcygpIHtcbiAgICAgIHZhciBpZHMgPSBleHRyYWN0TGlzdHModGhpcy5hdHRyaWJ1dGVzLCB0aGlzLmlkcylcblxuICAgICAgZm9yICh2YXIge3BhdGgsIHR5cGV9IGluIGlkcykge1xuICAgICAgICBpZCA9IHRoaXMuZ2V0KHBhdGgpXG4gICAgICAgIGlmIChpZCAmJiAhKGF3YWl0IHR5cGUubWV0YS5Nb2RlbC5maW5kQnlJZChcIlwiICsgaWQpKSlcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYCR7cGF0aH0gaGF2ZSBub3QgYSB2YWxpZCBJRGApXG4gICAgICB9XG4gICAgfVxuXG4gICAgYXN5bmMgZW5zdXJlVW5pcXVlKCkge1xuICAgICAgdmFyIHVuaXF1ZXMgPSBnZXRQYXRoRm9yVHlwZSh0aGlzLlNjaGVtYSwgJ3VuaXF1ZScpXG4gICAgICBmb3IgKHZhciB7cGF0aCwgdHlwZX0gb2YgdW5pcXVlcykge1xuICAgICAgICBhd2FpdCB0aGlzLmNvbnN0cnVjdG9yLmluZGV4KHBhdGgsIHt1bmlxdWU6IHRydWV9KVxuICAgICAgfVxuXG4gICAgICBmb3IgKHZhciBpID0gMCwgbGVuXyA9IHRoaXMuX2hvb2tzLmJlZm9yZS5zYXZlLmxlbmd0aDsgaSA8IGxlbl87IGkrKykge1xuICAgICAgICB2YXIgaG9vayA9IHRoaXMuX2hvb2tzLmJlZm9yZS5zYXZlW2ldXG4gICAgICAgIGlmIChob29rID09PSB0aGlzLmVuc3VyZVVuaXF1ZSkge1xuICAgICAgICAgIGRlbGV0ZSB0aGlzLl9ob29rcy5iZWZvcmUuc2F2ZVtpXVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBhc3luYyB2YWxpZGF0ZSgpIHtcbiAgICAgIHZhciB2YWwgPSB0LnZhbGlkYXRlKHRoaXMuZ2V0KCksIHRoaXMuU2NoZW1hKVxuICAgICAgaWYgKCF2YWwuaXNWYWxpZCgpKVxuICAgICAgICB0aHJvdyB2YWwuZXJyb3JzXG4gICAgICByZXR1cm4gYXdhaXQgdGhpcy52YWxpZGF0ZUlkcygpXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIFNvblxufVxuXG5mdW5jdGlvbiB1bmlxdWUoVHlwZSkge1xuICByZXR1cm4gdC5yZWZpbmVtZW50KFR5cGUsICgpID0+IHRydWUsICd1bmlxdWUnKVxufVxuXG52YXIgcmVnZXhJRCA9IC9eKD89W2EtZlxcZF17MjR9JCkoXFxkK1thLWZdfFthLWZdK1xcZCkvaVxuZnVuY3Rpb24gSUQoTW9kZWwpIHtcbiAgbGV0IHJlZiA9IHQucmVmaW5lbWVudCh0LlN0cmluZywgKHN0cikgPT4ge1xuICAgIGlmIChyZWdleElELnRlc3Qoc3RyKSlcbiAgICAgIHJldHVybiB0cnVlXG4gICAgZWxzZVxuICAgICAgcmV0dXJuIGZhbHNlXG4gIH0sIFwiSURcIilcbiAgcmVmLm1ldGEuTW9kZWwgPSBNb2RlbFxuXG4gIHJldHVybiByZWZcbn1cblxubGV0IE1vbmdvcml0byAgICAgID0gcmVxdWlyZSgnbW9uZ29yaXRvJylcbk1vbmdvcml0by5Nb2RlbCAgICA9IHBhdGNoKE1vbmdvcml0by5Nb2RlbClcbk1vbmdvcml0by5wYXRjaCAgICA9IHBhdGNoXG5Nb25nb3JpdG8udCAgICAgICAgPSByZXF1aXJlKCd0Y29tYicpXG5Nb25nb3JpdG8udC51bmlxdWUgPSB1bmlxdWVcbk1vbmdvcml0by50LklEICAgICA9IElEXG5cbm1vZHVsZS5leHBvcnRzID0gTW9uZ29yaXRvXG4iXX0=