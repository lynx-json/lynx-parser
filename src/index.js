const util = require("util");
const reservedKeys = ["spec", "value", "realm", "base", "focus", "context"];
const contentType = require("content-type");
const url = require("url");

exports.parse = async(content, options) => {
  async function prepareNode(source, templateSpec) {
    var node = {};

    var spec = (source && source.spec) || templateSpec;

    if (typeof spec === "string") {
      if (!options.resolveSpecURL) throw new Error("You must provide a resolveSpecURL function as an option.");
      spec = url.resolve(base, spec);
      node.spec = await options.resolveSpecURL(spec);
    } else {
      node.spec = spec;
    }

    if (templateSpec && typeof templateSpec === "object") {
      node.spec = Object.assign({}, templateSpec, node.spec);
    }

    var value = source === null || source.value === undefined ? source : source.value;

    if (util.isArray(value)) node.value = [];
    else if (util.isObject(value)) node.value = {};
    else node.value = value;

    if (util.isObject(value)) {
      for (let p in value) {
        if (reservedKeys.indexOf(p) !== -1) continue;

        let spec = util.isArray(node.spec.children) ?
          node.spec.children.find(item => item.name === p) :
          node.spec.children;

        if (spec || util.isArray(value)) node.value[p] = await prepareNode(value[p], spec);
        else node.value[p] = value[p];
      }
    }

    return node;
  }

  var type = contentType.parse(options && options.type || "application/lynx+json");
  var source = JSON.parse(content);
  var base = source.base || type.parameters.base || options && options.location;
  var doc = await prepareNode(source);

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
};
