#!/bin/bash
set -e

export CAPROVER_APP=next-simple-chatgpt
export CAPROVER_TAR_FILE=./caprover_deployment.tar
if [ -f .env.local ]; then
  set -a
  source .env.local
  set +a
fi

pnpm build

echo "Creating archive out of repo and build artifacts..."
tar --exclude='.next/cache' -cf ./caprover_deployment.tar Dockerfile .next package.json pnpm-lock.yaml

echo "Deploying to machine 01..."
export CAPROVER_URL=$CAPROVER_MACHINE_01
npx caprover deploy > /dev/null

echo "Deploying to machine 02..."
export CAPROVER_URL=$CAPROVER_MACHINE_02
npx caprover deploy > /dev/null

rm caprover_deployment.tar
