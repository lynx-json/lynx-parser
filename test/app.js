const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const should = chai.should();
chai.use(chaiAsPromised);
const Luau = require("../src");

describe("app", function () {
  it("should make a request", function (done) {
    var app = new Luau();
    app.request("http://example.com/").then(function (ctx) {
      ctx.request.url.should.equal("http://example.com/");
      done();
    }).catch(done);
  });
  
  it("should call its middleware", function (done) {
    var app = new Luau();
    app.use(async (ctx) => {
      ctx.message = "Hello, Luau!";
    });
    
    app.request("http://example.com/").then(function (ctx) {
      ctx.message.should.equal("Hello, Luau!");
      done();
    }).catch(done);
  });
  
  it("should call its middleware in order", function (done) {
    var app = new Luau();
    
    app.use(async (ctx, next) => {
      ctx.order = [1];
      await next();
      ctx.order.push(3);
    });
    
    app.use(async ctx => {
      ctx.order.push(2);
    });
    
    app.request("http://example.com/").then(function (ctx) {
      ctx.order.should.deep.equal([1, 2, 3]);
      done();
    }).catch(done);
  });
  
  it("should have chainable middleware", function (done) {
    var app = new Luau();
    
    app.use(async (ctx, next) => {
      ctx.order = [1];
      await next();
      ctx.order.push(3);
    }).use(async ctx => {
      ctx.order.push(2);
    });
    
    app.request("http://example.com/").then(function (ctx) {
      ctx.order.should.deep.equal([1, 2, 3]);
      done();
    }).catch(done);
  });
  
  it("should fail on error", function (done) {
    var app = new Luau();
    
    app.use(async () => {
      throw new Error("Error!");
    });
    
    app.request("http://example.com/").catch(function (err) {
      err.message.should.equal("Error!");
      done();
    });
  });
});
