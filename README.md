Lynx Parser
=========================================================

Lynx Parser parses a string of lynx content and returns a promise for a normalized lynx document.

Structure
---------------------------------------------------------

### Normalization

During parsing, each specified node is expanded to an object with a value and a spec, and each hint is expanded to an object with a name.

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
          {
            "name": "container"
          }
        ],
        "children": {
          "hints": [
            {
              "name": "text"
            }
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
          {
            "name": "container"
          }
        ],
        "children": {
          "hints": [
            {
              "name": "text"
            }
          ]
        }
      },
      "value": [
        {
          "spec": {
            "hints": [
              {
                "name": "text"
              }
            ]
          },
          "value": "one"
        },
        {
          "spec": {
            "hints": [
              {
                "name": "text"
              }
            ]
          },
          "value": "two"
        },
        {
          "spec": {
            "hints": [
              {
                "name": "text"
              }
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
