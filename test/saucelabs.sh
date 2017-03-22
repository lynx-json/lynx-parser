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

completed=false
status=unknown
while [ "$completed" != 'true' ]
do
  result=$(curl https://saucelabs.com/rest/v1/$SAUCE_USERNAME/js-tests/status -X POST -u $SAUCE_USERNAME:$SAUCE_ACCESS_KEY -H 'Content-Type: application/json' -d "$tests")
  completed=$(echo "$result" | jq -r '.completed')
  
  if [ "$completed" != 'true' ]
  then
    echo "Waiting for results"
    sleep 5
  else
    failures=$(echo "$result" | jq -r '."js tests"[].result.failures' | grep '[1-9]')
    
    echo "$result" | jq -r '."js tests"[]'

    if [ -z "$failures" ]
    then
      status="All Remote Tests Passed"
    else
      status="Tests Failed. See Output Above."
    fi
  fi
done

curl $url'/stop'
echo $status

if [ "$status" == 'pass' ]
then
  exit 0
else
  exit 1
fi
