const util = require("util");
const reservedKeys = ["spec", "value", "realm", "base", "focus", "context"];
const preservedKeysForEmbedments = ["realm", "base", "focus", "context"];
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
    return value;
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
          else if (p === "data" && value[p] !== null && typeof value[p] === "object" && value.type && value.type.indexOf("application/lynx+json") > -1) {
            childPromises.push(
              prepareNode(value[p])
                .then(assignPropertyValue(node.value, p))
                .then(appendEmbedment(value[p]))
            );
          }
          else if (p === "sources" && util.isArray(value[p])) {
            childPromises.push(
              Promise.all(value.sources.map(prepareNode))
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
  
  function appendEmbedment(rawValue) {
    return function (embedment) {
      embedment.embedded = true;
      
      preservedKeysForEmbedments.forEach(function (p) {
        if (p in rawValue) embedment[p] = rawValue[p];
      });
      
      embedments.push(embedment);
      return embedment;
    };
  }
  
  var embedments = [];
  var type = contentType.parse(options && options.type || "application/lynx+json");
  var rawDocument = JSON.parse(content);
  var base = rawDocument.base || type.parameters.base || options && options.location;
  var realm = rawDocument.realm || type.parameters.realm;
  
  function assignDocumentProperties(doc) {
    if (realm) {
      doc.realm = doc.realm || realm;
    }

    if (base) {
      doc.base = doc.base || base;
    }

    if (!doc.embedded && rawDocument.context) {
      doc.context = rawDocument.context;
    }
    
    if (!doc.embedded && rawDocument.focus) {
      doc.focus = rawDocument.focus;
    }

    return doc;
  }

  return prepareNode(rawDocument).then(function (doc) {
    embedments.forEach(assignDocumentProperties);
    return assignDocumentProperties(doc);
  });
};
