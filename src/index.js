const util = require("util");
const reservedKeys = ["spec", "value", "realm", "base", "focus", "context"];
const contentType = require("content-type");
const url = require("url");

function matchesName(name) {
  return function (item) {
    return item.name === name;
  };
}

function assignPropertyValue(obj, property) {
  return function (value) {
    obj[property] = value;
  };
}

exports.parse = function (content, options) {
  function prepareSpec(spec) {
    if (typeof spec === "string") {
      if (!options.resolveSpecURL) return Promise.reject(new Error("You must provide a resolveSpecURL function as an option."));
      spec = url.resolve(base, spec);
      return options.resolveSpecURL(spec);
    } else {
      return Promise.resolve(spec);
    }
  }
  
  function prepareNode(source, templateSpec) {
    var node = {};
    var spec = (source && source.spec) || templateSpec;
    
    function prepareValue(rspec) {
      if (templateSpec && typeof templateSpec === "object") {
        node.spec = Object.assign({}, templateSpec, rspec);
      } else {
        node.spec = rspec;
      }
      
      var value = source === null || source.value === undefined ? source : source.value;
      
      if (util.isArray(value)) node.value = [];
      else if (util.isObject(value)) node.value = {};
      else node.value = value;
      
      var childPromises = [];
      
      if (util.isObject(value)) {
        for (let p in value) {
          if (reservedKeys.indexOf(p) !== -1) continue;

          let spec = util.isArray(node.spec.children) ?
            node.spec.children.find(matchesName(p)) :
            node.spec.children;

          if (spec || util.isArray(value)) {
            childPromises.push(
              prepareNode(value[p], spec)
                .then(assignPropertyValue(node.value, p))
            );
          }
          else {
            node.value[p] = value[p];
          }
        }
      }
      
      return Promise.all(childPromises)
        .then(function () {
          return node;
        });
    }
    
    return prepareSpec(spec).then(prepareValue);
  }
  
  var type = contentType.parse(options && options.type || "application/lynx+json");
  var source = JSON.parse(content);
  var base = source.base || type.parameters.base || options && options.location;
  
  return prepareNode(source).then(function (doc) {
    var realm = source.realm || type.parameters.realm;
    
    if (realm) {
      doc.realm = realm;
    }

    if (base) {
      doc.base = base;
    }

    if (source.focus) {
      doc.focus = source.focus;
    }

    if (source.context) {
      doc.context = source.context;
    }

    return doc;
  });
};
