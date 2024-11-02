
#!/bin/bash
set -e

export CAPROVER_APP=simple-chatgpt
export CAPROVER_TAR_FILE=./caprover_deployment.tar
set -a
source .env.local
set +a

pnpm build

echo "Creating archive out of repo and build artifacts..."
tar --exclude='.next/cache' -cf ./caprover_deployment.tar Dockerfile .next package.json pnpm-lock.yaml

echo "Deploying to machine 01..."
export CAPROVER_URL=$CAPROVER_MACHINE_01
caprover deploy > /dev/null

echo "Deploying to machine 02..."
export CAPROVER_URL=$CAPROVER_MACHINE_02
caprover deploy > /dev/null

rm caprover_deployment.tar
