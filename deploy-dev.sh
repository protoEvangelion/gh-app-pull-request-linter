#!/bin/bash

npm install
npm run build

ls lib

# echo APP_ID=8 >> .env
# echo WEBHOOK_PROXY_URL=https://the-great-protoevangelion-site.netlify.app/.netlify/functions/webhooks >> .env
# echo GITHUB_CLIENT_ID=Iv1.98f0093831725bb8 >> .env
# echo PORT=3000 >> .env
# echo PRIVATE_KEY=$PRIVATE_KEY >> .env
# echo WEBHOOK_SECRET=$WEBHOOK_SECRET >> .env
# echo GITHUB_CLIENT_SECRET=$GITHUB_CLIENT_SECRET >> .env

# ls -la