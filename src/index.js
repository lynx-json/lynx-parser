/* jshint node: true */
/* jshint esversion: 6 */
"use strict";

const Emitter = require("events");

class Request {
  constructor(url, options) {
    this.url = url;
    
    if (options && options.type) {
      this.content = {
        type: options.type,
        data: options.data
      };
    } 
    
    if (options && options.enctype) this.enctype = options.enctype;
    if (options && options.formData) this.formData = options.formData;
    
    this.options = options;
    this.headers = {};
    
    if (options && options.headers) {
      for (var p in options.headers) {
        this.set(p, options.headers[p]);
      }
    }
  }
  
  set(header, value) {
    this.headers[header.toLowerCase()] = value;
  }
  
  get(header) {
    return this.headers[header.toLowerCase()];
  }
}

class Context {
  constructor(request) {
    this.request = request;
  }
}

function createNext(fn, ctx, next) {
  return () => fn(ctx, next);
}

function compose(middleware) {
  return function (ctx, next) {
    if (!next) next = async () => {};
    if (middleware.length === 0) return next();

    var i = middleware.length;
  
    while (i--) {
      next = createNext(middleware[i], ctx, next);
    }
    
    return next();
  };
}

module.exports = class Application extends Emitter {
  constructor() {
    super();
    this.middleware = [];
  }
  
  request(url, content) {
    var ctx = new Context(new Request(url, content));
    
    return compose(this.middleware)(ctx).then(() => {
      return ctx;
    }).catch(err => {
      this.emit("error", err);
    });
  }
  
  use(fn) {
    this.middleware.push(fn);
    return this;
  }
};
