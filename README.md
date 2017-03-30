Lynx Parser
=========================================================

[![Build Status](https://travis-ci.org/lynx-json/lynx-parser.svg?branch=master)](https://travis-ci.org/lynx-json/lynx-parser)

[![Sauce Test Status](https://saucelabs.com/buildstatus/lynx-json)](https://saucelabs.com/u/lynx-json)

Lynx Parser parses a string of lynx content and returns a promise for a 
normalized lynx document.

Structure
---------------------------------------------------------

### Normalization

During parsing, each specified node is expanded to an object with a value and a 
spec.

Consider the following source document:

```JSON
{
  "items": [
    "one",
    "two",
    "three"
  ],
  "spec": {
    "hints": [
      "container"
    ],
    "children": [
      {
        "name": "items",
        "hints": [
          "container"
        ],
        "children": {
          "hints": [
            "text"
          ]
        }
      }
    ]
  }
}

```

Calling `LYNX.parse(source)` results in the following normalized structure:

```JSON
{
  "spec": {
    "hints": [
      {
        "name": "container"
      }
    ],
    "children": [
      {
        "name": "items",
        "hints": [
          "container"
        ],
        "children": {
          "hints": [
            "text"
          ]
        }
      }
    ]
  },
  "value": {
    "items": {
      "spec": {
        "name": "items",
        "hints": [
          "container"
        ],
        "children": {
          "hints": [
            "text"
          ]
        }
      },
      "value": [
        {
          "spec": {
            "hints": [
              "text"
            ]
          },
          "value": "one"
        },
        {
          "spec": {
            "hints": [
              "text"
            ]
          },
          "value": "two"
        },
        {
          "spec": {
            "hints": [
              "text"
            ]
          },
          "value": "three"
        }
      ]
    }
  }
}

```

### Data Properties

Data properties are left intact.

Consider the following link document with an unspecified `href` value.

```JSON
{
  "href": "http://example.com",
  "spec": {
    "hints": [
      "link"
    ]
  }
}
```

The resulting parsed document is left with its original `href` value:

```JSON
{
  "spec": {
    "hints": [
      {
        "name": "link"
      }
    ]
  },
  "value": {
    "href": "http://example.com"
  }
}
```

### Document-Level Properties

The document-level properties `realm`, `base`, `focus`, and `context` are left on the
document-level value/spec pair:

Consider the following document:

```JSON
{
  "realm": "http://example.com/greeting/",
  "base": "http://example.com/hello-world/",
  "focus": "message",
  "context": "http://example.com/",
  "message": "Hello, World!",
  "spec": {
    "hints": [
      "container"
    ],
    "children": [
      {
        "name": "message",
        "hints": [
          "text"
        ]
      }
    ]
  }
}
```

The resulting parsed document is left with four document-level properties,
`base`, `realm`, `focus`, and `context`.
The `value` has a single property, `message`.

```JSON
{
  "spec": {
    "hints": [
      "container"
    ],
    "children": [
      {
        "name": "message",
        "hints": [
          "text"
        ]
      }
    ]
  },
  "value": {
    "message": {
      "spec": {
        "name": "message",
        "hints": [
          "text"
        ]
      },
      "value": "Hello, World!"
    }
  },
  "realm": "http://example.com/greeting/",
  "base": "http://example.com/hello-world/",
  "focus": "message",
  "context": "http://example.com/"
}
```

Usage
---------------------------------------------------------

### A Simple Lynx Document

```js
const LYNX = require("lynx-parser");

var input = {
  "value": "Hello, World!",
  "spec": {
    "hints": [ "text" ]
  }
};

var output = await LYNX.parse(JSON.stringify(input));

console.log(output.value === "Hello, World!");
console.log(output.spec.hints[0].name === "text");

```

### Resolving Spec URLs

To resolve specs referenced by URL, provide options with a `resolveSpecURL` function, 
accepting a URL and returning a promise for an object.

```js
const LYNX = require("lynx-parser");

var input = {
  "value": "Hello, World!",
  "spec": "http://example.com/specs/greeting"
};

var options = {
  resolveSpecURL: async url => {
    return {
      hints: [ "text" ]
    };
  }
};

var output = await LYNX.parse(JSON.stringify(input), options);

console.log(output.value === "Hello, World!");
console.log(output.spec.hints[0].name === "text");

```

### Content-Type Parameters

The content type `application/lynx+json` includes optional parameters that may 
be necessary to effectively parse the content. You may include the full type name as an option.

```js
const LYNX = require("lynx-parser");

var input = {
  "value": "Hello, World!",
  "spec": {
    "hints": [ "text" ]
  }
};

var options = {
  type: 'application/lynx+json;realm="http://example.com/greeting/";base="http://example.com/hello-world/"'
};

var output = await LYNX.parse(JSON.stringify(input), options);
console.log(output.realm === "http://example.com/greeting/");
console.log(output.base === "http://example.com/hello-world/");
```

### Base URI and Document Location

You should provide a document location to be used as a base URI in the case where base
is specified in neither a content type parameter nor in content.

```js
const LYNX = require("lynx-parser");

var input = {
  "value": "Hello, World!",
  "spec": {
    "hints": [ "text" ]
  }
};

var options = {
  location: "http://example.com/hello-world/"
};

var output = await LYNX.parse(JSON.stringify(input), options);
console.log(output.base === "http://example.com/hello-world/");
```
