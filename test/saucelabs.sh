#!/bin/sh
read url; 
echo "Listening at $url";

curl https://saucelabs.com/rest/v1/$SAUCE_USERNAME/js-tests -X POST -u $SAUCE_USERNAME:$SAUCE_ACCESS_KEY -H 'Content-Type: application/json' --data '{  "platforms": [["Windows 7", "firefox", "27"],  ["Linux", "googlechrome", ""]],  "url": "'$url'",  "framework": "mocha"}';
