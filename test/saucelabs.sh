#!/bin/bash
read url; 
echo "Listening at $url";

if [ -z "$TRAVIS_JOB_NUMBER" ]
then
  curl $url'/stop'
  echo No TRAVIS_JOB_NUMBER. Not executing remote tests.
  exit 0
fi


options='{  "platforms": [["Windows 7", "firefox", "27"],  ["Linux", "googlechrome", ""]],  "url": "'$url'", "tunnelIdentifier": "'$TRAVIS_JOB_NUMBER'",  "framework": "mocha"}';

tests=$(curl https://saucelabs.com/rest/v1/$SAUCE_USERNAME/js-tests -X POST -u $SAUCE_USERNAME:$SAUCE_ACCESS_KEY -H 'Content-Type: application/json' -d "$options")

complete=false
status=unknown
while [ "$complete" != 'true' ]
do
  result=$(curl https://saucelabs.com/rest/v1/$SAUCE_USERNAME/js-tests/status -X POST -u $SAUCE_USERNAME:$SAUCE_ACCESS_KEY -H 'Content-Type: application/json' -d "$tests")
  complete=$(echo "$result" | jq -r '.complete')
  status=$(echo "$result" | jq -r '.status')
  echo "$complete"
  count=count+1
  
  if [ "$complete" != 'true' ]
  then
    echo "Waiting for results"
    sleep 5
  fi
done

curl $url'/stop'
echo $status

if [ "$status" == 'ok' ]
then
  exit 0
else
  exit 1
fi
