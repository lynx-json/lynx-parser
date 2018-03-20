const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const expect = chai.expect;
const should = chai.should();
chai.use(chaiAsPromised);
const LYNX = require("../src");
import "babel-polyfill";

describe("LYNX.parse", function () {
  it("should parse a string of lynx content", function () {
    var lynx = {
      value: "Hello, World!",
      spec: {
        hints: [{
          name: "text"
        }]
      }
    };

    return LYNX.parse(JSON.stringify(lynx)).then(doc => {
      doc.value.should.equal(lynx.value);
      doc.spec.should.deep.equal(lynx.spec);
    });
  });

  it("should resolve a spec URL", function () {
    var lynx = {
      base: "http://example.com/",
      value: "Hello, World!",
      spec: "http://example.com/specs/greeting"
    };

    var spec = {
      hints: [{
        name: "text"
      }]
    };

    var options = {
      resolveSpecURL: url => {
        if (url === lynx.spec) return Promise.resolve(spec);
      }
    };

    return LYNX.parse(JSON.stringify(lynx), options).then(doc => {
      doc.value.should.equal(lynx.value);
      doc.spec.should.deep.equal(spec);
    });
  });

  it("should throw when resolveSpecURL is not provided", function () {
    var lynx = {
      value: "Hello, World!",
      spec: "http://example.com/specs/greeting"
    };

    var spec = {
      hints: [{
        name: "text"
      }]
    };

    var options = {};

    return LYNX.parse(JSON.stringify(lynx), options)
      .then(doc => {})
      .catch(err => {
        expect(err.message).to.equal("You must provide a resolveSpecURL function as an option.");
      });
  });

  it("should expand each node to a value/spec pair", function () {
    var lynx = {
      message: "Hello, World!",
      spec: {
        hints: [{
          name: "container"
        }],
        children: [{
          name: "message",
          hints: [{
            name: "text"
          }]
        }]
      }
    };

    return LYNX.parse(JSON.stringify(lynx)).then(doc => {
      doc.spec.should.deep.equal(lynx.spec);
      doc.value.message.value.should.equal("Hello, World!");
      doc.value.message.spec.should.deep.equal({
        name: "message",
        hints: [{
          name: "text"
        }]
      });
    });
  });

  it("should recognize null or empty text values", function () {
    var lynx = {
      emptyValue: {
        value: ""
      },
      nullValue: {
        value: null
      },
      spec: {
        hints: [{
          name: "container"
        }],
        children: [{
          name: "emptyValue",
          hints: [{
            name: "text"
          }]
        }, {
          name: "nullValue",
          hints: [{
            name: "text"
          }]
        }]
      }
    };

    return LYNX.parse(JSON.stringify(lynx)).then(doc => {
      doc.spec.should.deep.equal(lynx.spec);
      doc.value.emptyValue.value.should.equal("");
      should.not.exist(doc.value.nullValue.value);
    });
  });

  it("should include a spec for each item in an array", function () {
    var lynx = {
      items: [
        "one",
        "two",
        "three"
      ],
      spec: {
        hints: ["container"],
        children: [{
          name: "items",
          hints: ["container"],
          children: {
            hints: ["text"]
          }
        }]
      }
    };

    return LYNX.parse(JSON.stringify(lynx)).then(doc => {
      doc.value.items.value[0].value.should.equal("one");
      doc.value.items.value[1].value.should.equal("two");
      doc.value.items.value[2].value.should.equal("three");
      var childSpec = {
        hints: ["text"]
      };
      doc.value.items.value[0].spec.should.deep.equal(childSpec);
      doc.value.items.value[1].spec.should.deep.equal(childSpec);
      doc.value.items.value[2].spec.should.deep.equal(childSpec);
    });
  });

  it("should allow array items to be named", function () {
    var lynx = {
      items: [
        "one",
        "two",
        "three"
      ],
      spec: {
        name: "itemName",
        hints: ["container"],
        children: [{
          name: "items",
          hints: ["container"],
          children: {
            hints: ["text"]
          }
        }]
      }
    };

    return LYNX.parse(JSON.stringify(lynx)).then(doc => {
      doc.value.items.value[0].value.should.equal("one");
      doc.value.items.value[1].value.should.equal("two");
      doc.value.items.value[2].value.should.equal("three");
      var childSpec = {
        hints: ["text"]
      };
      doc.value.items.value[0].spec.should.deep.equal(childSpec);
      doc.value.items.value[1].spec.should.deep.equal(childSpec);
      doc.value.items.value[2].spec.should.deep.equal(childSpec);
    });
  });

  it("should not normalize data properties", function () {
    var lynx = {
      href: "http://example.com",
      spec: {
        hints: ["link"]
      }
    };

    return LYNX.parse(JSON.stringify(lynx)).then(doc => {
      doc.value.href.should.equal("http://example.com");
    });
  });

  it("should leave `realm`, `base`, and `focus` on the document and not on the value", function () {
    var lynx = {
      realm: "http://example.com/greeting/",
      base: "http://example.com/hello-world/",
      focus: "message",
      context: "http://example.com/",
      message: "Hello, World!",
      spec: {
        hints: ["container"],
        children: [{
          name: "message",
          hints: ["text"]
        }]
      }
    };

    return LYNX.parse(JSON.stringify(lynx)).then(doc => {
      doc.realm.should.equal("http://example.com/greeting/");
      doc.base.should.equal("http://example.com/hello-world/");
      doc.focus.should.equal("message");
      doc.context.should.equal("http://example.com/");
      should.not.exist(doc.value.realm);
      should.not.exist(doc.value.base);
      should.not.exist(doc.value.focus);
      should.not.exist(doc.value.context);
    });
  });

  it("should copy type parameters realm and base to the parsed document", function () {
    var lynx = {
      value: "Hello, World!",
      spec: {
        hints: ["text"]
      }
    };

    var options = {
      type: 'application/lynx+json;realm="http://example.com/greeting/";base="http://example.com/hello-world/"'
    };

    return LYNX.parse(JSON.stringify(lynx), options).then(doc => {
      doc.realm.should.equal("http://example.com/greeting/");
      doc.base.should.equal("http://example.com/hello-world/");
    });
  });

  it("should prioritize realm and base defined in content", function () {
    var lynx = {
      realm: "http://example.com/greeting/in-content/",
      base: "http://example.com/hello-world/in-content/",
      message: "Hello, World!",
      spec: {
        hints: ["container"],
        children: {
          hints: ["text"]
        }
      }
    };

    var options = {
      type: 'application/lynx+json;realm="http://example.com/greeting/";base="http://example.com/hello-world/"'
    };

    return LYNX.parse(JSON.stringify(lynx), options).then(doc => {
      doc.realm.should.equal("http://example.com/greeting/in-content/");
      doc.base.should.equal("http://example.com/hello-world/in-content/");
    });
  });

  it("should fall back to a base at the document location", function () {
    var lynx = {
      message: "Hello, World!",
      spec: {
        hints: ["container"],
        children: {
          hints: ["text"]
        }
      }
    };

    var options = {
      location: "http://example.com/hello-world/"
    };

    return LYNX.parse(JSON.stringify(lynx), options).then(doc => {
      doc.base.should.equal("http://example.com/hello-world/");
    });
  });

  it("should copy 'name' property from child spec to node spec", function () {
    var lynx = {
      spec: {
        hints: ["container"],
        children: [{
          name: "foo"
        }]
      },
      value: {
        foo: {
          spec: {
            hints: ["text"]
          },
          value: "The spec for this value has a 'name' of 'foo'."
        }
      }
    };

    var options = {
      location: "http://example.com/hello-world/"
    };

    return LYNX.parse(JSON.stringify(lynx), options).then(doc => {
      expect(doc.value.foo.spec.name).to.equal("foo");
    });
  });  
  
  it("should continue processing array items when array has no children defined", function () {
    var lynx = {
      spec: {
        hints: ["container"]
      },
      value: [{
        spec: {
          hints: ["container"],
          children: [
            { name: "foo" },
            { name: "bar" }
          ]
        },
        value: {
          foo: {
            spec: { hints: ["text"] },
            value: "Foo"
          },
          bar: {
            spec: { hints: ["text"] },
            value: "Bar"
          }
        }
      }]
    };

    var options = {
      location: "http://example.com/hello-world/"
    };

    return LYNX.parse(JSON.stringify(lynx), options).then(doc => {
      expect(doc.value[0].value.foo.spec.name).to.equal("foo");
      expect(doc.value[0].value.foo.value).to.equal("Foo");
      expect(doc.value[0].value.bar.spec.name).to.equal("bar");
      expect(doc.value[0].value.bar.value).to.equal("Bar");
    });
  });
  
  it("should parse 'data' property for Lynx object value", function () {
    var lynx = {
      spec: {
        hints: ["content"]
      },
      type: "application/lynx+json",
      data: {
        spec: {
          hints: ["container"],
          children: {
            hints: ["text"]
          }
        },
        value: [
          "One",
          "Two",
          "Three"
        ]
      }
    };

    var options = {
      location: "http://example.com/hello-world/"
    };

    return LYNX.parse(JSON.stringify(lynx), options).then(doc => {
      var embeddedDocument = doc.value.data;
      expect(embeddedDocument.value.length).to.equal(3);
      expect(embeddedDocument.value[0].spec.hints[0]).to.equal("text");
      expect(embeddedDocument.value[0].value).to.equal("One");
    });
  });
  
  it("should parse 'sources' property", function () {
    var specForContent = JSON.stringify({ hints: ["content"] });
    
    var lynx = {
      spec: JSON.parse(specForContent),
      src: "/foo",
      sources: [
        {
          spec: JSON.parse(specForContent),
          media: "http://example.com/media-1",
          src: "/content-for-media-1"
        }
      ]
    };

    var options = {
      location: "http://example.com/hello-world/"
    };

    return LYNX.parse(JSON.stringify(lynx), options).then(doc => {
      expect(doc.value.sources.length).to.equal(1);
      expect(doc.value.sources[0].spec.hints[0]).to.equal("content");
      expect(doc.value.sources[0].value.src).to.equal("/content-for-media-1");
      expect(doc.value.sources[0].value.media).to.equal("http://example.com/media-1");
    });
  });
});
