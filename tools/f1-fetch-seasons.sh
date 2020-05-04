#!/bin/bash

for season in {1950..2019}; do
    curl http://ergast.com/api/f1/$season/results.json?limit=1000 | python -m json.tool > f1-season-${season}.json
   #curl http://ergast.com/api/f1/$season/results.json?limit=1000  > f1-season-${season}-minified.json
done

