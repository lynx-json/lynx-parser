#!/bin/sh
read url; 
echo "Listening at $url";

options='{  "platforms": [["Windows 7", "firefox", "27"],  ["Linux", "googlechrome", ""]],  "url": "'$url'", "tunnelIdentifier": "'$TRAVIS_JOB_NUMBER'",  "framework": "mocha"}';

result=$(curl https://saucelabs.com/rest/v1/$SAUCE_USERNAME/js-tests -X POST -u $SAUCE_USERNAME:$SAUCE_ACCESS_KEY -H 'Content-Type: application/json' -d "$options")

echo $result

# curl https://saucelabs.com/rest/v1/$SAUCE_USERNAME/js-tests/status -X POST -u $SAUCE_USERNAME:$SAUCE_ACCESS_KEY -H 'Content-Type: application/json' -d $result
