var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
var should = chai.should();
chai.use(chaiAsPromised);
const Luau = require("../src");

describe("request", function () {
  it("should accept a url", function (done) {
    var app = new Luau();
    app.request("http://example.com/").then(function (ctx) {
      ctx.request.url.should.equal("http://example.com/");
      done();
    }).catch(done);
  });
  
  it("should accept a url and content with type", function (done) {
    var app = new Luau();
    var content = {
      type: "text/plain",
      data: new Buffer("Hello")
    };
    
    var request = app.request("http://example.com", content);
    
    request.then(function (ctx) {
      ctx.request.content.should.deep.equal(content);
      done();
    }).catch(done);
  });
  
  it("should accept a url and formData with enctype", function (done) {
    var app = new Luau();
    
    var enctype = "application/x-www-form-urlencoded";
    var formData = new Set();
    
    var request = app.request("http://example.com", {
      enctype: "application/x-www-form-urlencoded",
      formData: formData
    });
    
    request.then(function (ctx) {
      ctx.request.enctype.should.equal(enctype);
      ctx.request.formData.should.equal(formData);
      done();
    }).catch(done);
  });
  
  it("should accept arbitrary options", function (done) {
    var app = new Luau();
    
    var options = {};
    app.request("http://example.com/", options).then(ctx => {
      ctx.request.options.should.equal(options);
      done();
    }).catch(done);
  });
  
  it("should accept a dictionary of headers", function (done) {
    var app = new Luau();
    
    var options = {
      headers: {
        "X-Files": "true"
      }
    };
    
    app.request("http://example.com/", options).then(ctx => {
      ctx.request.get("x-files").should.equal("true");
      done();
    }).catch(done);
  });
  
  it("should set a header value", function (done) {
    var app = new Luau();
    app.use(async ctx => {
      ctx.request.set("x-files", "true");
    });
    
    app.request("http://example.com/").then(ctx => {
      ctx.request.get("x-files").should.equal("true");
      done();
    }).catch(done);
  });
});
