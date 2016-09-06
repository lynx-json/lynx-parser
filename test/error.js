const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const should = chai.should();
chai.use(chaiAsPromised);
const Luau = require("../src");

describe("app.on('error')", function () {
  it("should raise on middleware error", function (done) {
    var app = new Luau();
    
    app.on("error", err => {
      err.message.should.equal("Error!");
      done();
    });
    
    app.use(async () => {
      throw new Error("Error!");
    });
    
    app.request("http://example.com/");
  });
});
