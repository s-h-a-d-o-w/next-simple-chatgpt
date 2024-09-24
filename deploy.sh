#!/bin/bash
set -e

export CAPROVER_APP=simple-chatgpt
export CAPROVER_TAR_FILE=./caprover_deployment.tar

pnpm build

echo "Creating archive out of repo and build artifacts..."
tar -cf ./caprover_deployment.tar --exclude=.idea --exclude=coverage/* --exclude=node_modules/* .

echo "Deploying to machine 01..."
export CAPROVER_URL=$CAPROVER_MACHINE_01
caprover deploy > /dev/null

echo "Deploying to machine 02..."
export CAPROVER_URL=$CAPROVER_MACHINE_02
caprover deploy > /dev/null

rm caprover_deployment.tar
