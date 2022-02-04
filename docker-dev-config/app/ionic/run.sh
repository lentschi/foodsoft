#!/bin/bash -ve
/srv/config/ionic/prepare.sh
export N_PREFIX="$HOME/n"; [[ :$PATH: == *":$N_PREFIX/bin:"* ]] || PATH+=":$N_PREFIX/bin"
cd /srv/project
# ionic serve --no-interactive --no-open
npx ng serve --proxy-config docker-proxy.conf.json --no-open --host "0.0.0.0" --disable-host-check --port 8100
