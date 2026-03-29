#!/usr/bin/env sh
set -o errexit   # abort on nonzero exitstatus
set -o nounset   # abort on unbound variable
set -o pipefail  # don't hide errors within pipes

EXISTING_VARS="
\$BASE_API_URL
\$PLATFORM_API_URL
\$PLAYGROUND_URL
\$DEFAULT_NAMESPACE
\$KEYCLOAK_ISSUER
\$KEYCLOAK_REDIRECT_URI
\$KEYCLOAK_CLIENT_ID
\$KEYCLOAK_SCOPES
"

for file in $JSFOLDER;
do
  envsubst "$EXISTING_VARS" < $file > /tmp/$(basename $file)
  mv /tmp/$(basename $file) $file
done
echo "Starting nginx"
nginx -g 'daemon off;'
