#!/bin/sh
{ read url; echo "Listening at $url";  }

curl https://saucelabs.com/rest/v1/johnhowes/js-tests -X POST -H 'Content-Type: application/json' --data '{  "platforms": [["Windows 7", "firefox", "27"],  ["Linux", "googlechrome", ""]],  "url": "$url",  "framework": "mocha"}'
