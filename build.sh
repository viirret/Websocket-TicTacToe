#!/bin/bash

SCRIPTPATH="$( cd -- "$(dirname "$0")" >/dev/null 2>&1 ; pwd -P )"

# install dependencies
cd $SCRIPTPATH/backend
if [ ! -d node_modules ]; then
	npm install ws
fi

# open game in browser
cd $SCRIPTPATH
INDEX=$(realpath frontend/index.html)
xdg-open "file://$INDEX"

# start server
cd $SCRIPTPATH/backend
node server.js

