const LYNX = require("../src");
const test = require("tape");
import "babel-polyfill";

test("should parse a string of lynx content", function (assert) {
  var lynx = {
    value: "Hello, World!",
    spec: {
      hints: [ { name: "text" } ]
    }
  };
  
  LYNX.parse(JSON.stringify(lynx)).then(doc => {
    assert.equal(doc.value, lynx.value);
    assert.deepEqual(doc.spec, lynx.spec);
    assert.end();
  }).catch(e => assert.fail(e));
});

test("should resolve a spec URL", function (assert) {
  var lynx = {
    "value": "Hello, World!",
    "spec": "http://example.com/specs/greeting"
  };
  
  var spec = {
    hints: [ { name: "text" } ]
  };
  
  var options = {
    resolveSpecURL: async url => {
      if (url === lynx.spec) return spec;
    }
  };
  
  LYNX.parse(JSON.stringify(lynx), options).then(doc => {
    assert.equal(doc.value, lynx.value);
    assert.deepEqual(doc.spec, spec);
    assert.end();
  }).catch(e => assert.fail(e));
});

test("should throw when resolveSpecURL is not provided", function (assert) {
  var lynx = {
    "value": "Hello, World!",
    "spec": "http://example.com/specs/greeting"
  };
  
  var spec = {
    hints: [ { name: "text" } ]
  };
  
  var options = {};
  
  LYNX.parse(JSON.stringify(lynx), options).then(doc => {
  }).catch(err => {
    assert.equal(err.message, "You must provide a resolveSpecURL function as an option.")
    assert.end();
  });
});

test("should expand each node to a value/spec pair", function (assert) {
  var lynx = {
    message: "Hello, World!",
    spec: {
      hints: [ { name: "container" } ],
      children: [
        {
          name: "message",
          hints: [ { name: "text" } ]
        }
      ]
    }
  };
  
  LYNX.parse(JSON.stringify(lynx)).then(doc => {
    assert.deepEqual(doc.spec, lynx.spec);
    assert.equal(doc.value.message.value, "Hello, World!");
    assert.deepEqual(doc.value.message.spec, {
      name: "message",
      hints: [ { name: "text" } ]
    });
    assert.end();
  }).catch(e => assert.fail(e));
});

test("should include a spec for each item in an array", function (assert) {
  var lynx = {
    items: [
      "one",
      "two",
      "three"
    ],
    spec: {
      hints: [ "container" ],
      children: [
        {
          name: "items",
          hints: [ "container" ],
          children: {
            hints: [ "text" ]
          }
        }
      ]
    }
  };
  
  LYNX.parse(JSON.stringify(lynx)).then(doc => {
    assert.equal(doc.value.items.value[0].value, "one");
    assert.equal(doc.value.items.value[1].value, "two");
    assert.equal(doc.value.items.value[2].value, "three");
    var childSpec = { hints: [ "text" ]};
    assert.deepEqual(doc.value.items.value[0].spec, childSpec);
    assert.deepEqual(doc.value.items.value[1].spec, childSpec);
    assert.deepEqual(doc.value.items.value[2].spec, childSpec);
    assert.end();
  }).catch(e => assert.fail(e));
});

test("should not normalize data properties", function (assert) {
  var lynx = {
    href: "http://example.com",
    spec: {
      hints: [ "link" ]
    }
  };
  
  LYNX.parse(JSON.stringify(lynx)).then(doc => {
    assert.equal(doc.value.href, "http://example.com");
    assert.end();
  }).catch(e => assert.fail(e));
});

test("should leave realm and base on the document and not on the value", function (assert) {
  var lynx = {
    realm: "http://example.com/greeting/",
    base: "http://example.com/hello-world/",
    message: "Hello, World!",
    spec: {
      hints: [ "container" ],
      children: {
        hints: [ "text" ]
      }
    }
  };
  
  LYNX.parse(JSON.stringify(lynx)).then(doc => {
    assert.equal(doc.realm, "http://example.com/greeting/");
    assert.equal(doc.base, "http://example.com/hello-world/");
    assert.equal(doc.value.realm, undefined);
    assert.equal(doc.value.base, undefined);
    assert.end();
  }).catch(e => assert.fail(e));
});

test("should copy type parameters realm and base to the parsed document", function (assert) {
  var lynx = {
    value: "Hello, World!",
    spec: {
      hints: [ "text" ]
    }
  };
  
  var options = {
    type: 'application/lynx+json;realm="http://example.com/greeting/";base="http://example.com/hello-world/"'
  };
  
  LYNX.parse(JSON.stringify(lynx), options).then(doc => {
    assert.equal(doc.realm, "http://example.com/greeting/");
    assert.equal(doc.base, "http://example.com/hello-world/");
    assert.end();
  }).catch(e => assert.fail(e));
});

test("should prioritize realm and base defined in content", function (assert) {
  var lynx = {
    realm: "http://example.com/greeting/in-content/",
    base: "http://example.com/hello-world/in-content/",
    message: "Hello, World!",
    spec: {
      hints: [ "container" ],
      children: {
        hints: [ "text" ]
      }
    }
  };
  
  var options = {
    type: 'application/lynx+json;realm="http://example.com/greeting/";base="http://example.com/hello-world/"'
  };
  
  LYNX.parse(JSON.stringify(lynx), options).then(doc => {
    assert.equal(doc.realm, "http://example.com/greeting/in-content/");
    assert.equal(doc.base, "http://example.com/hello-world/in-content/");
    assert.end();
  }).catch(e => assert.fail(e));
});

test("should fall back to a base at the document location", function (assert) {
  var lynx = {
    message: "Hello, World!",
    spec: {
      hints: [ "container" ],
      children: {
        hints: [ "text" ]
      }
    }
  };
  
  var options = {
    location: "http://example.com/hello-world/"
  };
  
  LYNX.parse(JSON.stringify(lynx), options).then(doc => {
    assert.equal(doc.base, "http://example.com/hello-world/");
    assert.end();
  }).catch(e => assert.fail(e));
});
