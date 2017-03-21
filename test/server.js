const http = require("http");
const path = require("path");
const url = require("url");
const fs = require("fs");

var index = fs.readFileSync(path.resolve(__dirname, "./index.html"));
var bundle = fs.readFileSync(path.resolve(__dirname, "./bundle.js"));

var server = http.createServer(function (req, res) {
  var uri = url.parse(req.url).pathname;
  
  if (uri === "/bundle.js") {
    res.setHeader("content-type", "text/javascript");
    return res.end(bundle);
  }
  
  if (uri === "/") {
    res.setHeader("content-type", "text/html");
    return res.end(index);
  }
  
  res.setHeader("content-type", "text/plain");
  res.end("404 (Not Found)");
  
}).listen(0);

console.log("http://localhost:" + server.address().port);

return server;
