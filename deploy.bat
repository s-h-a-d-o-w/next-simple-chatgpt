set CAPROVER_APP=simple-chatgpt
set CAPROVER_TAR_FILE=./caprover_deployment.tar

pnpm build

wsl tar -cf ./caprover_deployment.tar --exclude=.idea --exclude=coverage/* --exclude=node_modules/* .

set CAPROVER_URL=%CAPROVER_MACHINE_01%
npx caprover deploy

set CAPROVER_URL=%CAPROVER_MACHINE_02%
npx caprover deploy

del caprover_deployment.tar
