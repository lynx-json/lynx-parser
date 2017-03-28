const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const should = chai.should();
chai.use(chaiAsPromised);
const LYNX = require("../src");
import "babel-polyfill";

describe("LYNX.parse", function () {
  it("should parse a string of lynx content", function (done) {
    var lynx = {
      value: "Hello, World!",
      spec: {
        hints: [ { name: "text" } ]
      }
    };
    
    LYNX.parse(JSON.stringify(lynx)).then(doc => {
      doc.value.should.equal(lynx.value);
      doc.spec.should.deep.equal(lynx.spec);
      done();
    }).catch(done);
  });
  
  it("should resolve a spec URL", function (done) {
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
      doc.value.should.equal(lynx.value);
      doc.spec.should.deep.equal(spec);
      done();
    }).catch(done);
  });
  
  it("should throw when resolveSpecURL is not provided", function (done) {
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
      err.message.should.equal("You must provide a resolveSpecURL function as an option.");
      done();
    });
  });
  
  it("should expand each node to a value/spec pair", function (done) {
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
      doc.spec.should.deep.equal(lynx.spec);
      doc.value.message.value.should.equal("Hello, World!");
      doc.value.message.spec.should.deep.equal({
        name: "message",
        hints: [ { name: "text" } ]
      });
      done();
    }).catch(done);
  });
  
  it("should include a spec for each item in an array", function (done) {
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
      doc.value.items.value[0].value.should.equal("one");
      doc.value.items.value[1].value.should.equal("two");
      doc.value.items.value[2].value.should.equal("three");
      var childSpec = { hints: [ "text" ]};
      doc.value.items.value[0].spec.should.deep.equal(childSpec);
      doc.value.items.value[1].spec.should.deep.equal(childSpec);
      doc.value.items.value[2].spec.should.deep.equal(childSpec);
      // console.log(JSON.stringify(doc, null, 2));
      done();
    }).catch(done);
  });
  
  it("should not normalize data properties", function (done) {
    var lynx = {
      href: "http://example.com",
      spec: {
        hints: [ "link" ]
      }
    };
    
    LYNX.parse(JSON.stringify(lynx)).then(doc => {
      doc.value.href.should.equal("http://example.com");
      done();
    }).catch(done);
  });
  
  it("should leave `realm`, `base`, and `focus` on the document and not on the value", function (done) {
    var lynx = {
      realm: "http://example.com/greeting/",
      base: "http://example.com/hello-world/",
      focus: "message",
      message: "Hello, World!",
      spec: {
        hints: [ "container" ],
        children: [
          {
            name: "message",
            hints: [ "text" ]
          }
        ]
      }
    };
    
    LYNX.parse(JSON.stringify(lynx)).then(doc => {
      doc.realm.should.equal("http://example.com/greeting/");
      doc.base.should.equal("http://example.com/hello-world/");
      doc.focus.should.equal("message");
      should.not.exist(doc.value.realm);
      should.not.exist(doc.value.base);
      should.not.exist(doc.value.focus);
      done();
    }).catch(done);
  });
  
  it("should copy type parameters realm and base to the parsed document", function (done) {
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
      doc.realm.should.equal("http://example.com/greeting/");
      doc.base.should.equal("http://example.com/hello-world/");
      done();
    }).catch(done);
  });
  
  it("should prioritize realm and base defined in content", function (done) {
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
      doc.realm.should.equal("http://example.com/greeting/in-content/");
      doc.base.should.equal("http://example.com/hello-world/in-content/");
      done();
    }).catch(done);
  });
  
  it("should fall back to a base at the document location", function (done) {
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
      doc.base.should.equal("http://example.com/hello-world/");
      done();
    }).catch(done);
  });
});
