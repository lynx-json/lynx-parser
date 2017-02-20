const util = require("util");
const reservedKeys = [ "spec", "value", "realm", "base" ];
const contentType = require("content-type");
const polyfill = require("babel-polyfill");

exports.parse = async (content, options) => {
  async function prepareNode(source, templateSpec) {
    var node = {};
    
    var spec = source.spec || templateSpec;
    if (typeof spec === "string") {
      if (!options.resolveSpecURL) throw new Error("You must provide a resolveSpecURL function as an option.");
      node.spec = await options.resolveSpecURL(spec);
    } else {
      node.spec = spec;
    }
    
    node.spec.hints = node.spec.hints.map(hint => typeof hint === "string" ? { name: hint } : hint);
    
    var value = source.value || source;
    
    if (util.isArray(value)) node.value = [];
    else if (util.isObject(value)) node.value = {};
    else node.value = value;
    
    if (util.isObject(value)) {
      for (let p in value) {
        if (reservedKeys.indexOf(p) !== -1) continue;
        
        let spec = util.isArray(node.spec.children) ? 
          node.spec.children.find(item => item.name === p) : 
          node.spec.children;
          
        if (spec) node.value[p] = await prepareNode(value[p], spec);
        else node.value[p] = value[p];
      }
    }
    
    return node;
  }
  
  var type = contentType.parse(options && options.type || "application/lynx+json");
  var source = JSON.parse(content);
  var doc = await prepareNode(source);
  doc.realm = source.realm || type.parameters.realm;
  doc.base = source.base || type.parameters.base || options && options.location;
  return doc;
};
