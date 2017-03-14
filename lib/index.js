"use strict";

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var util = require("util");
var reservedKeys = ["spec", "value", "realm", "base"];
var contentType = require("content-type");

exports.parse = function () {
  var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(content, options) {
    var prepareNode = function () {
      var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee(source, templateSpec) {
        var _this = this;

        var node, spec, value, _loop, p, _ret;

        return regeneratorRuntime.wrap(function _callee$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                node = {};
                spec = source.spec || templateSpec;

                if (!(typeof spec === "string")) {
                  _context2.next = 10;
                  break;
                }

                if (options.resolveSpecURL) {
                  _context2.next = 5;
                  break;
                }

                throw new Error("You must provide a resolveSpecURL function as an option.");

              case 5:
                _context2.next = 7;
                return options.resolveSpecURL(spec);

              case 7:
                node.spec = _context2.sent;
                _context2.next = 11;
                break;

              case 10:
                node.spec = spec;

              case 11:
                value = source.value || source;


                if (util.isArray(value)) node.value = [];else if (util.isObject(value)) node.value = {};else node.value = value;

                if (!util.isObject(value)) {
                  _context2.next = 24;
                  break;
                }

                _loop = regeneratorRuntime.mark(function _loop(p) {
                  var spec;
                  return regeneratorRuntime.wrap(function _loop$(_context) {
                    while (1) {
                      switch (_context.prev = _context.next) {
                        case 0:
                          if (!(reservedKeys.indexOf(p) !== -1)) {
                            _context.next = 2;
                            break;
                          }

                          return _context.abrupt("return", "continue");

                        case 2:
                          spec = util.isArray(node.spec.children) ? node.spec.children.find(function (item) {
                            return item.name === p;
                          }) : node.spec.children;

                          if (!spec) {
                            _context.next = 9;
                            break;
                          }

                          _context.next = 6;
                          return prepareNode(value[p], spec);

                        case 6:
                          node.value[p] = _context.sent;
                          _context.next = 10;
                          break;

                        case 9:
                          node.value[p] = value[p];

                        case 10:
                        case "end":
                          return _context.stop();
                      }
                    }
                  }, _loop, _this);
                });
                _context2.t0 = regeneratorRuntime.keys(value);

              case 16:
                if ((_context2.t1 = _context2.t0()).done) {
                  _context2.next = 24;
                  break;
                }

                p = _context2.t1.value;
                return _context2.delegateYield(_loop(p), "t2", 19);

              case 19:
                _ret = _context2.t2;

                if (!(_ret === "continue")) {
                  _context2.next = 22;
                  break;
                }

                return _context2.abrupt("continue", 16);

              case 22:
                _context2.next = 16;
                break;

              case 24:
                return _context2.abrupt("return", node);

              case 25:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee, this);
      }));

      return function prepareNode(_x3, _x4) {
        return _ref2.apply(this, arguments);
      };
    }();

    var type, source, doc;
    return regeneratorRuntime.wrap(function _callee2$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            type = contentType.parse(options && options.type || "application/lynx+json");
            source = JSON.parse(content);
            _context3.next = 4;
            return prepareNode(source);

          case 4:
            doc = _context3.sent;

            doc.realm = source.realm || type.parameters.realm;
            doc.base = source.base || type.parameters.base || options && options.location;
            return _context3.abrupt("return", doc);

          case 8:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee2, undefined);
  }));

  return function (_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();