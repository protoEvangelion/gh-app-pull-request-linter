#!/bin/bash

npm install --production
npm run build

echo APP_ID=9 >> .env
echo WEBHOOK_PROXY_URL=https://smee.io/QP7r1VqtXvExRaV/.netlify/functions/webhooks >> .env
echo GITHUB_CLIENT_ID=Iv1.084fb48ab7161f79 >> .env
echo PORT=3000 >> .env
echo PRIVATE_KEY=$PRIVATE_KEY >> .env
echo WEBHOOK_SECRET=$WEBHOOK_SECRET >> .env
echo GITHUB_CLIENT_SECRET=$GITHUB_CLIENT_SECRET >> .env

